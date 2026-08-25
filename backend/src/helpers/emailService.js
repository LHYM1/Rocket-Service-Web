
const transporter = require('../config/mailer');

async function enviarTokenTecnico(destinatario, token) {
  await transporter.sendMail({
    from: '"RocketService" <no-reply@rocketservice.com>',
    to: destinatario,
    subject: 'Código de activación - RocketService',
    html: `
      <p>Tu código de activación es: <strong>${token}</strong></p>
      <p>Válido por 12 minutos.</p>
    `
  });
}

module.exports = { enviarTokenTecnico };