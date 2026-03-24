const db = require('../../config/db');

const users = {
    findAll: async () => { // Este método sirve para traer toda la tabla de usuarios
        const [rows] = await db.query('SELECT * FROM usuarios');
    
        return rows;
            
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id_usuario  = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            nombre, 
            apellido, 
            correo_usuario, 
            telefono_usuario, 
        } = data;

        const [result] = await db.query('INSERT INTO usuarios (nombre, apellido, correo_usuario, telefono_usuario, contrasena) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, correo_usuario, telefono_usuario, null, 1]);
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre, 
            apellido, 
            correo_usuario, 
            telefono_usuario, 
        } = data;

        const [result] = await db.query('UPDATE usuarios SET nombre = ?, apellido = ?, correo_usuario = ?, telefono_usuario = ? WHERE id_usuario = ?',
            [nombre, apellido, correo_usuario, telefono_usuario, id]);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = users;
