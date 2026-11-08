import 'dotenv/config';
import { enviarTokenTecnico } from './src/helpers/emailService.js';

const probarEnvioCorreo = async () => {
    try {
        // Envia el correo a tu propia dirección configurada en el .env
        const correoPrueba = process.env.EMAIL_USER; 
        const tokenPrueba = 'TK-987654';

        console.log(`Enviando correo de prueba a: ${correoPrueba}...`);
        
        await enviarTokenTecnico(correoPrueba, tokenPrueba);

        console.log('¡Correo enviado con éxito! Revisa tu bandeja de entrada o SPAM.');
        process.exit(0);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        process.exit(1);
    }
};

probarEnvioCorreo();