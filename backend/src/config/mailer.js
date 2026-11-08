import nodemailer from 'nodemailer';

// Crear el objeto transporter con la configuración del servidor SMTP (Gmail)
//
// "family: 4" fuerza que la conexión use siempre IPv4 -- sin esto, en Render
// a veces intenta conectarse por IPv6 y falla con ENETUNREACH, dejando la
// petición "colgada" sin responder nunca (ni éxito ni error visible al usuario).
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Límites de tiempo -- si algo vuelve a fallar (aunque sea distinto a esto),
    // la petición falla con un error claro en máximo ~15 segundos, en vez de
    // quedarse "colgada" indefinidamente sin ninguna respuesta al usuario.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

// Verificar la conexión con el servidor SMTP al iniciar
transporter.verify()
    .then(() => console.log('Servidor de correo (SMTP) conectado correctamente'))
    .catch((error) => console.error('Error al conectar con el servidor de correo:', error));

export default transporter;