const jwt = require("jsonwebtoken");
const pool = require("../../config/db"); // conexion a mysql
const bcrypt = require("bcrypt");

// register
const register = async (req, res) => {
  const { contrasena, nombre, apellido, correo_usuario, telefono_usuario } = req.body;

  try {
    const ID_TECNICO = 2; 

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await pool.query(
      `INSERT INTO usuarios (contrasena, nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ hashedPassword, nombre, apellido, correo_usuario, telefono_usuario, ID_TECNICO ]
    );

    res.json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
};


// login
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
    
    // Comparar contraseñas encriptadas
    const match = await bcrypt.compare(contrasena, user.contrasena);
    
    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign (
       { 
        id: user.id_usuario, 
        role: user.role, // role es alias
        nombre: user.nombre, 
        apellido: user.apellido 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1min" }
    );

    res.json({ token });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor", error });
    }
};

module.exports = { login, register };