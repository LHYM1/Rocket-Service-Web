import bcrypt from 'bcrypt';
import authModel from '../auth/auth.model.js';

export const registerTecnico = async (req, res) => {
  const { correo_usuario, tokenRegistro, contrasena, nombre, apellido, telefono_usuario } = req.body;

  try {
    const registroToken = await authModel.findTecnicoTokenByEmail(correo_usuario);

    if (!registroToken) {
      return res.status(400).json({ 
        message: "No existe una invitación pendiente para este correo o el usuario ya fue activado." 
      });
    }

    if (registroToken.intentos >= 5) {
      return res.status(401).json({ 
        message: "Has superado el límite de 5 intentos fallidos. Solicita un nuevo código." 
      });
    }

    if (registroToken.minutos_transcurridos > 10) {
      return res.status(401).json({ 
        message: "El código de activación ha expirado (límite de 10 minutos)." 
      });
    }

    const esTokenValido = await bcrypt.compare(tokenRegistro, registroToken.token);

    if (!esTokenValido) {
      await authModel.incrementarIntentosToken(registroToken.id_token);
      return res.status(400).json({ message: "El código de activación es incorrecto." });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await authModel.updateUsuarioActivo({
      id_usuario: registroToken.id_usuario,
      hashedPassword,
      nombre,
      apellido,
      telefono_usuario
    });

    await authModel.deleteTokenById(registroToken.id_token);

    return res.status(200).json({ message: "Técnico activado correctamente." });

  } catch (error) {
    console.error("Error en activación de técnico:", error);
    return res.status(500).json({ message: "Error interno en el servidor." });
  }
};

// Endpoint para verificar si el token sigue vigente al cargar el modal/formulario
export const validarEstadoToken = async (req, res) => {
  const { correo_usuario } = req.query;

  try {
    const registroToken = await authModel.findTecnicoTokenByEmail(correo_usuario);

    if (!registroToken) {
      return res.status(404).json({ 
        valido: false, 
        motivo: "TOKEN_NO_ENCONTRADO",
        message: "No hay invitaciones pendientes para este usuario." 
      });
    }

    if (registroToken.intentos >= 5) {
      return res.status(400).json({ 
        valido: false, 
        motivo: "MAX_INTENTOS",
        message: "Has superado el límite de intentos fallidos." 
      });
    }

    if (registroToken.minutos_transcurridos > 10) {
      return res.status(400).json({ 
        valido: false, 
        motivo: "EXPIRADO",
        message: "El código de activación ha expirado." 
      });
    }

    // Token válido para continuar
    return res.status(200).json({ 
      valido: true, 
      message: "Token válido." 
    });

  } catch (error) {
    console.error("Error al validar el estado del token:", error);
    return res.status(500).json({ message: "Error interno en el servidor." });
  }
};

export const consumirTokenCliente = async (req, res) => {
  try {
    return res.status(200).json({ message: "Token consumido correctamente." });
  } catch (error) {
    console.error("Error al consumir token:", error);
    return res.status(500).json({ message: "Error interno en el servidor." });
  }
};

const tokenController = {
  registerTecnico,
  validarEstadoToken,
  consumirTokenCliente
};

export default tokenController;