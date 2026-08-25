import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from './src/config/db.js';

const crearAdmin = async () => {
    try {
        const nombre =  process.env.ADMIN_NOMBRE;
        const apellido = process.env.ADMIN_APELLIDO;
        const correo_usuario = process.env.ADMIN_EMAIL;
        const telefono_usuario = process.env.ADMIN_TELEFONO;
        const contrasena  = process.env.ADMIN_PASSWORD;

        const ID_ADMIN = 3; 

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        await pool.query(
            `INSERT INTO usuarios 
            (contrasena, nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?),
            ONDUPLICATE KET UPDATE id_tipo_usuario = VALUES(id_tipo_usuario)`,
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