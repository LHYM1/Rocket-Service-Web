
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
          <p style="margin-top: 15px; color: #66c;">El código y enlace son válidos por 10 minutos.</p>  
        </div>
      `
    });
};

// Envío de token de activación al cliente para establecer su contraseña
export const enviarTokenCliente = async (destinatario, urlCliente) => {
    await transporter.sendMail({
      from: `"RocketService" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Establece tu contraseña - RocketService',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e;">
          <h2>¡Bienvenido a RocketService!</h2>
          <p>Un administrador te ha registrado como cliente en nuestra plataforma.</p>
          <p>Para poder ingresar a tu panel, por favor asigna tu contraseña haciendo clic en el siguiente botón:</p>
          <div style="margin: 25px 0;">
            <a href="${urlCliente}" style="background-color: #ff7300; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Establecer Contraseña
            </a>
          </div>
          <p style="font-size: 13px; color: #666;">
            O también puedes copiar y pegar el siguiente enlace en tu navegador:<br>
            <a href="${urlCliente}" style="color: #ff7300;">${urlCliente}</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Este enlace es único y tiene una vigencia estricta de 24 horas.
          </p>  
        </div>
      `
    });
};