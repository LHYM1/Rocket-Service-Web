import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from './src/config/db.js';

const crearAdmin = async () => {
    try {
        const nombre = "Kevin";
        const apellido = "Vargas";
        const correo_usuario = "kevin@gmail.com";
        const telefono_usuario = "3226786545";
        const contrasena = "1234";

        const ID_ADMIN = 3; 

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        await pool.query(
            `INSERT INTO usuarios 
            (contrasena, nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [hashedPassword, nombre, apellido, correo_usuario, telefono_usuario, ID_ADMIN]
        );

        console.log("Admin creado correctamente");
        process.exit();
        
    } catch (error) {
        console.error("Error al crear admin:", error);
        process.exit(1);
    }
};

crearAdmin();