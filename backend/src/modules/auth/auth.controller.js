import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { FormValidators } from '@rocket/shared';
import pool from '../../config/db.js';
import {
  findTecnicoTokenByEmail,
  updateUsuarioActivo,
  deleteTokenById,
  incrementarIntentosToken,
  findUsuarioLoginByEmail,
  findClienteTokenByHash
} from './auth.model.js';

// 1. Registro / Activación de Técnico
const register = async (req, res) => {
  const { tokenRegistro, contrasena, nombre, apellido, correo_usuario, telefono_usuario } = req.body;

  if (!tokenRegistro || !correo_usuario || !contrasena) {
    return res.status(400).json({ message: "El correo, contraseña y código de activación son obligatorios." });
  }

  if (!FormValidators.esSoloLetras(nombre) || !FormValidators.esSoloLetras(apellido) || !FormValidators.esTelefonoValido(telefono_usuario)) {
    return res.status(400).json({ message: "Los datos de perfil ingresados no tienen un formato válido." });
  }

  try {
    const usuario = await findTecnicoTokenByEmail(correo_usuario);

    if (!usuario) {
      return res.status(400).json({ message: "No existe una invitación pendiente para este correo o el usuario ya fue activado." });
    }

    // A. VALIDACIÓN DE EXPIRACIÓN (10 MINUTOS)
    if (usuario.minutos_transcurridos >= 10) {
      await deleteTokenById(usuario.id_token);
      return res.status(401).json({ message: "El código de activación ha expirado (límite 10 minutos). Solicita una nueva invitación." });
    }

    // B. VALIDACIÓN DE INTENTOS MÁXIMOS (5 INTENTOS)
    if (usuario.intentos >= 5) {
      await deleteTokenById(usuario.id_token);
      return res.status(401).json({ message: "Has superado el límite de 5 intentos fallidos. La invitación ha sido invalidada." });
    }

    // C. VERIFICACIÓN DEL CÓDIGO CON BCRYPT
    const esTokenValido = await bcrypt.compare(tokenRegistro, usuario.token);

    if (!esTokenValido) {
      const nuevosIntentos = usuario.intentos + 1;
      await incrementarIntentosToken(usuario.id_token);

      if (nuevosIntentos >= 5) {
        await deleteTokenById(usuario.id_token);
        return res.status(401).json({ message: "Has superado el límite de 5 intentos fallidos. La invitación ha sido invalidada." });
      }

      const intentosRestantes = 5 - nuevosIntentos;
      return res.status(400).json({ 
        message: `El código de activación es incorrecto. Te quedan ${intentosRestantes} intento(s).` 
      });
    }

    // D. REGISTRO EXITOSO
    // Nota: la versión original usaba una transacción real (pool.getConnection() +
    // beginTransaction/commit/rollback), propia de mysql2. Nuestro db.js de PostgreSQL
    // no expone ese método -- solo .query(). Se ejecutan las 2 operaciones seguidas;
    // el riesgo de que una falle justo después de la otra es mínimo y de bajo impacto
    // (en el peor caso, un token quedaría sin borrar, no algo crítico como un pago).
    const hashedPassword = await bcrypt.hash(contrasena, 12);

    await updateUsuarioActivo({ 
      id_usuario: usuario.id_usuario, 
      hashedPassword, 
      nombre: FormValidators.normalizarTexto(nombre), 
      apellido: FormValidators.normalizarTexto(apellido), 
      telefono_usuario: telefono_usuario.trim() 
    });

    await deleteTokenById(usuario.id_token);

    return res.status(200).json({ message: "Técnico activado correctamente." });

  } catch (error) {
    console.error("Error al registrar técnico:", error);
    return res.status(500).json({ message: "Error en el servidor al registrar técnico." });
  }
};

// 1.1 Endpoint para validar el estado del código desde el Frontend sin procesar formulario
export const validarCodigoTecnico = async (req, res) => {
  const { correo_usuario } = req.query;

  if (!correo_usuario) {
    return res.status(400).json({ valido: false, message: "Correo no proporcionado." });
  }

  try {
    const usuario = await findTecnicoTokenByEmail(correo_usuario);

    if (!usuario) {
      return res.status(404).json({ 
        valido: false, 
        message: "El enlace ya ha sido utilizado o la invitación no existe." 
      });
    }

    if (usuario.minutos_transcurridos >= 10) {
      await deleteTokenById(usuario.id_token);
      return res.status(401).json({ valido: false, message: "El tiempo de activación (10 minutos) ha expirado." });
    }

    if (usuario.intentos >= 5) {
      await deleteTokenById(usuario.id_token);
      return res.status(401).json({ valido: false, message: "Límite de 5 intentos fallidos superado." });
    }

    return res.json({ 
      valido: true, 
      correo_usuario, 
      minutosRestantes: 10 - usuario.minutos_transcurridos 
    });

  } catch (error) {
    console.error("Error al validar código técnico:", error);
    return res.status(500).json({ valido: false, message: "Error interno en el servidor." });
  }
};

export const validarTokenCliente = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ valido: false, message: "Token no proporcionado." });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const registroToken = await findClienteTokenByHash(tokenHash);

    if (!registroToken) {
      return res.status(404).json({ valido: false, message: "El enlace no es válido o ya fue utilizado." });
    }

    if (registroToken.intentos >= 5) {
      return res.status(401).json({ valido: false, message: "Límite de intentos superado. El enlace ha sido invalidado." });
    }

    if (registroToken.horas_transcurridas >= 24) {
      return res.status(401).json({ valido: false, message: "El enlace ha expirado (límite 24 horas)." });
    }

    return res.json({ valido: true, message: "Token válido." });

  } catch (error) {
    console.error("Error al validar token:", error);
    return res.status(500).json({ valido: false, message: "Error interno del servidor." });
  }
};

// 2. Verificación de correo
export const verificarCorreo = async (req, res) => {
  const { correo_usuario } = req.query;

  if (!correo_usuario) {
    return res.status(400).json({ message: "Correo no proporcionado" });
  }

  if (!FormValidators.esEmailValido(correo_usuario)) {
    return res.status(400).json({ message: "Formato de correo inválido" });
  }

  try {
    const [rows] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo_usuario = ?', [correo_usuario]);
        
    if (rows.length > 0) {
      return res.json({ valido: false, motivo: "duplicado" });
    }

    return res.json({ valido: true });
  } catch (error) {
    console.error("ERROR VERIFICAR CORREO:", error);
    return res.status(500).json({ message: "Error al verificar el correo" });
  }
};

// 3. Login
const login = async (req, res) => {
  const { correo_usuario, contrasena } = req.body;

  if (!correo_usuario || !contrasena) {
    return res.status(400).json({ message: "Por favor ingresa correo y contraseña." });
  }

  try {
    const user = await findUsuarioLoginByEmail(correo_usuario);

    // Solo permite login a usuarios en estado 2 (Registrados)
    if (!user || user.estado !== 2) {
      return res.status(401).json({ message: "Credenciales inválidas o cuenta pendiente de activación." });
    }

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        role: user.role, 
        nombre: user.nombre, 
        apellido: user.apellido 
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: "8h" }
    );

    return res.json({ 
      token, 
      user: { 
        id: user.id_usuario, 
        role: user.role, 
        nombre: user.nombre,
        apellido: user.apellido,
        correo_usuario: user.correo_usuario
      } 
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno en el servidor." });
  }
};

// 4. Establecer contraseña cliente
const establecerContrasenaCliente = async (req, res) => {
  const { token, contrasena } = req.body;

  if (!token || !contrasena) {
    return res.status(400).json({ message: "El token y la contraseña son obligatorios." });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const registroToken = await findClienteTokenByHash(tokenHash);

    if (!registroToken) {
      return res.status(400).json({ message: "El enlace no es válido o ya fue utilizado." });
    }

    if (registroToken.intentos >= 5) {
      await deleteTokenById(registroToken.id_token);
      return res.status(401).json({ message: "Límite de 5 intentos superado. El enlace ha sido invalidado." });
    }

    if (registroToken.horas_transcurridas >= 24) {
      return res.status(401).json({ message: "El enlace ha expirado (límite 24 horas)." });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 12);

    // Pasa el cliente a estado = 2
    await updateUsuarioActivo({ id_usuario: registroToken.id_usuario, hashedPassword });
    await deleteTokenById(registroToken.id_token);

    const tokenSesion = jwt.sign(
      { id: registroToken.id_usuario, role: "Cliente" },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: "8h" }
    );

    return res.json({ 
      message: "Contraseña establecida con éxito", 
      token: tokenSesion 
    });

  } catch (error) {
    console.error("Error al establecer contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor al procesar la solicitud." });
  }
};

export default { 
  login, 
  register, 
  verificarCorreo, 
  establecerContrasenaCliente, 
  validarTokenCliente,
  validarCodigoTecnico
};