import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  findTecnicoTokenByEmail,
  updateUsuarioActivo,
  deleteTokenById,
  findUsuarioActivoByEmail,
  findUsuarioLoginByEmail,
  findClienteTokenByString
} from './auth.model.js';

// 1. Registro / Activación de Técnico
const register = async (req, res) => {
  const { tokenRegistro, contrasena, nombre, apellido, correo_usuario, telefono_usuario } = req.body;

  if (!tokenRegistro || !correo_usuario) {
    return res.status(400).json({ message: "El correo y el código de activación son obligatorios." });
  }

  try {
    const usuario = await findTecnicoTokenByEmail(correo_usuario);

    if (!usuario) {
      return res.status(400).json({ message: "No existe una invitación pendiente para este correo o el usuario ya está activo." });
    }

    // Comparar los 6 dígitos ingresados contra el hash guardado en tokens_autenticacion
    const esTokenValido = await bcrypt.compare(tokenRegistro, usuario.token);
    if (!esTokenValido) {
      return res.status(400).json({ message: "El código de activación es incorrecto." });
    }

    // Validar tiempo límite del técnico: máximo 10 minutos
    if (usuario.minutos_transcurridos > 10) {
      return res.status(401).json({ message: "El código de activación ha expirado (límite 10 minutos). Solicita uno nuevo." });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Actualizar usuario y eliminar el token usado
    await updateUsuarioActivo({ id_usuario: usuario.id_usuario, hashedPassword, nombre, apellido, telefono_usuario });
    await deleteTokenById(usuario.id_token);

    return res.json({ message: "Técnico registrado y activado correctamente" });

  } catch (error) {
    console.error("Error al registrar técnico:", error);
    return res.status(500).json({ message: "Error en el servidor al registrar técnico", error });
  }
};

// 2. Verificación de existencia de correo
const verificarCorreo = async (req, res) => {
  const { correo_usuario } = req.query;

  try {
    const exists = await findUsuarioActivoByEmail(correo_usuario);
    res.json({ exists });
  } catch (error) {
    console.error("Error al verificar correo:", error);
    res.status(500).json({ message: "Error al verificar correo" });
  }
};

// 3. Login
const login = async (req, res) => {
  const { correo_usuario, contrasena } = req.body;

  try {
    const user = await findUsuarioLoginByEmail(correo_usuario);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        role: user.role, 
        nombre: user.nombre, 
        apellido: user.apellido 
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
      
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

// 4. Establecer contraseña rol cliente (vía URL)
const establecerContrasenaCliente = async (req, res) => {
  const { token, contrasena } = req.body;

  if (!token || !contrasena) {
    return res.status(400).json({ message: "El token y la contraseña son obligatorios" });
  }

  try {
    const registroToken = await findClienteTokenByString(token);

    if (!registroToken) {
      return res.status(400).json({ message: "El enlace no es válido o ya fue utilizado." });
    }

    // Validar tiempo límite del cliente: máximo 24 horas
    if (registroToken.horas_transcurridas >= 24) {
      return res.status(401).json({ message: "El enlace ha expirado (límite 24 horas). Solicita uno nuevo." });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Actualizar usuario y eliminar el token usado
    await updateUsuarioActivo({ id_usuario: registroToken.id_usuario, hashedPassword });
    await deleteTokenById(registroToken.id_token);

    const tokenSesion = jwt.sign(
      { id: registroToken.id_usuario, role: "Cliente" },
      process.env.JWT_SECRET || 'secreto_rocket_service',
      { expiresIn: "8h" }
    );

    return res.json({ 
      message: "Contraseña establecida con éxito", 
      token: tokenSesion 
    });

  } catch (error) {
    console.error("Error al establecer contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor", error });
  }
};

export default { login, register, verificarCorreo, establecerContrasenaCliente };