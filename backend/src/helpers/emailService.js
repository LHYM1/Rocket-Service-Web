import transporter from '../config/mailer.js';

// Estilos compartidos entre los dos correos, para que se vean consistentes
const wrapperEstilo = `font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px; margin: 0;`;
const cardEstilo = `max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);`;
const headerEstilo = `background-color: #1a1a2e; padding: 28px 32px; text-align: center;`;
const bodyEstilo = `padding: 32px;`;
const footerEstilo = `padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #f0f0f0;`;

/**
 * Envia el token de activacion y enlace de registro al Tecnico
 */
export const enviarTokenTecnico = async (destinatario, token) => {
    const urlRegistro = `${process.env.FRONTEND_URL}/register?token=${token}`;

    await transporter.sendMail({
      from: `"Rocket Service" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Código de activación de cuenta - Rocket Service',
      html: `
        <div style="${wrapperEstilo}">
          <div style="${cardEstilo}">

            <div style="${headerEstilo}">
              <img src="https://res.cloudinary.com/duay1vobd/image/upload/v1789058464/PHOTO-2026-05-19-21-30-34_zssi0z.jpg"
                   alt="Rocket Service"
                   style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #ff8c00; margin-bottom: 8px;" />
              <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 600;">Rocket Service</h1>
            </div>

            <div style="${bodyEstilo}">
              <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 12px;">¡Bienvenido al equipo!</h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Un administrador te ha invitado a unirte como <strong>Técnico</strong> en Rocket Service.
                Usa el código de abajo para activar tu cuenta.
              </p>

              <div style="background-color: #fff8ee; border: 1px solid #ff8c0030; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="color: #9a5b00; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-weight: 600;">
                  Tu código de activación
                </p>
                <p style="color: #1a1a2e; font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0; font-family: monospace;">
                  ${token}
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${urlRegistro}"
                   style="background-color: #ff7300; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                  Completar Registro
                </a>
              </div>
            </div>

            <div style="${footerEstilo}">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                ⏱️ Este código es válido por <strong>10 minutos</strong>.<br>
                Si no esperabas este correo, puedes ignorarlo con confianza.
              </p>
            </div>

          </div>
        </div>
      `
    });
};

/**
 * Envío de token de activación al cliente (Token incrustado en botón, invisible en el texto)
 */
export const enviarTokenCliente = async (destinatario, urlCliente) => {
    await transporter.sendMail({
      from: `"Rocket Service" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: 'Establece tu contraseña - Rocket Service',
      html: `
        <div style="${wrapperEstilo}">
          <div style="${cardEstilo}">

            <div style="${headerEstilo}">
              <img src="https://res.cloudinary.com/duay1vobd/image/upload/v1789058464/PHOTO-2026-05-19-21-30-34_zssi0z.jpg"
                   alt="Rocket Service"
                   style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid #ff8c00; margin-bottom: 8px;" />
              <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 600;">Rocket Service</h1>
            </div>

            <div style="${bodyEstilo}">
              <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 12px;">¡Bienvenido a Rocket Service!</h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Un administrador te ha registrado como <strong>cliente</strong> en nuestra plataforma.
                Para activar tu cuenta e ingresar al sistema, establece tu contraseña con el botón de abajo.
              </p>

              <div style="text-align: center; margin-bottom: 8px;">
                <a href="${urlCliente}" target="_blank"
                   style="background-color: #ff7300; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                  Activar Mi Cuenta
                </a>
              </div>
            </div>

            <div style="${footerEstilo}">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                ⏱️ Este enlace es válido por <strong>24 horas</strong>.<br>
                Si no esperabas este correo, puedes ignorarlo con confianza.
              </p>
            </div>

          </div>
        </div>
      `
    });
};