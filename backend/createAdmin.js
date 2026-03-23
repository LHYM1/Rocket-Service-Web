require('dotenv').config();
const bcrypt = require("bcrypt");
const pool = require("./src/config/db"); 

const crearAdmin = async () => {
    try {
        const nombre = "Carlos";
        const apellido = "Cuesta";
        const correo_usuario = "admin@test.com";
        const telefono_usuario = "123456789";
        const contrasena = "123456";

        const ID_ADMIN = 3; // tipo de usuario administrador

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Insertar en la BD
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