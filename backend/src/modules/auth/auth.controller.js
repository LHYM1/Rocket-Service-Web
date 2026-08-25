import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  const { contrasena, nombre, apellido, correo_usuario, telefono_usuario } = req.body;

  try {
    const ID_TECNICO = 2; 

    // Verificar si el correo ya existe en la base de datos
    const [existente] = await pool.query(
      `SELECT * FROM usuarios WHERE correo_usuario = ?`,
      [correo_usuario]
    );

    if (existente.length > 0) {
      return res.status(409).json({ 
        message: "Este correo ya está registrado, por favor usa otro."
      })
    }
    
    // Si no hay correo duplicado, continuar con el registro
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await pool.query(
      `INSERT INTO usuarios (contrasena, nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ hashedPassword, nombre, apellido, correo_usuario, telefono_usuario, ID_TECNICO ]
    );

    res.json({ message: "Usuario registrado correctamente" });
    
  } catch (error) {
    // Red de seguridad (Si por alguna razón falla el UNIQUE "correo_usuario" en MySQL)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: "Este correo ya está registrado, por favor usa otro." 
      });
    }
    
    console.error("Error real al registrar:", error);
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};

// Verificación del correo en tiempo real (usada por el front mietras el usuario escribe)
const checkEmail = async (req, res) => {
  const { correo_usuario } = req.query;

  if (!correo_usuario) {
    return res.status(400).json({ message: "Correo no proporcionado" });
  } 

  try {
    const [existente] = await pool.query(
      `SELECT id_usuario FROM usuarios WHERE correo_usuario = ?`,
      [correo_usuario]
    );

    res.json({ exists: existente.length > 0 });

  } catch (error) {
    console.error("Error al verificar correo:", error);
    res.status(500).json({ message: "Error al verificar correo" });
  }
};

const login = async (req, res) => {
  const { correo_usuario, contrasena } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.contrasena, 
        c.categoria_usuario AS role
      FROM usuarios u
      INNER JOIN clasificacion_de_usuarios c
      ON u.id_tipo_usuario = c.id_tipo_usuario WHERE u.correo_usuario = ?`,
      [correo_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];
    
    const match = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign (
       { 
        id: user.id_usuario, 
        role: user.role, 
        nombre: user.nombre, 
        apellido: user.apellido 
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role});

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
};

export default { login, register, checkEmail };