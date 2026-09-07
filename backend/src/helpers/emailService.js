import transporter from '../config/mailer.js';

/**
 * Envia el token de activacion y enlace de registro al Tecnico
 */
export const enviarTokenTecnico = async (destinatario, token) => {
    const urlRegistro = `${process.env.FRONTEND_URL}/register?token=${token}`;

    await transporter.sendMail({
      from: `"RocketService" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Código de activación de cuenta - RocketService',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>¡Bienvenido a RocketService!</h2>
          <p>Un administrador ha creado tu cuenta como Técnico.</p>
          <p>Tu código de activación es: <strong style="font-size: 18px; color: #007bff;">${token}</strong></p>
          <p>Haz clic en el siguiente enlace para completar tu registro:</p>
          <a href="${urlRegistro}" style="background: #ff7300; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Completar Registro
          </a>
          <p style="margin-top: 15px; color: #666;">El código es válido por 10 minutos.</p>  
        </div>
      `
    });
};

/**
 * Envío de token de activación al cliente (Token incrustado en botón, invisible en el texto)
 */
export const enviarTokenCliente = async (destinatario, urlCliente) => {
    await transporter.sendMail({
      from: `"RocketService" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Establece tu contraseña - RocketService',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1a1a2e; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">¡Bienvenido a RocketService!</h2>
          <p>Un administrador te ha registrado como cliente en nuestra plataforma.</p>
          <p>Para activar tu cuenta e ingresar al sistema, haz clic en el siguiente botón seguro:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${urlCliente}" target="_blank" style="background-color: #ff7300; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Activar Mi Cuenta
            </a>
          </div>

          <p style="margin-top: 25px; font-size: 12px; color: #718096; line-height: 1.5;">
            Si no solicitaste este correo, puedes ignorarlo de manera segura.<br>
            Este enlace de activación expira automáticamente en 24 horas.
          </p>  
        </div>
      `
    });
};