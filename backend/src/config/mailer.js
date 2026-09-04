import nodemailer from 'nodemailer';

// Crear el objeto transporter con la configuración del servidor SMTP (Gmail)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar la conexión con el servidor SMTP al iniciar
transporter.verify()
    .then(() => console.log('Servidor de correo (SMTP) conectado correctamente'))
    .catch((error) => console.error('Error al conectar con el servidor de correo:', error));

export default transporter;