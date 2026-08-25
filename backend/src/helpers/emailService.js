
import transporter from '../config/mailer.js';

/**
 * Envia el token de activacion y enlace de registro al Tecnico
 */
export const enviarTokenTecnico = async (destinatario, token) => {
    const urlRegistro = `${process.env.FRONTEND_URL}/completar-registro?token=${token}`;

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
          <p style="margin-top: 15px; color: #66c;">El código y enlace son válidos por 24 horas.</p>
        </div>
      `
    });
};