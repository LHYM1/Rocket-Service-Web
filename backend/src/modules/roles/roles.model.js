const db = require('../../config/db');

const catUser = {
    findAll: async () => { // Este método sirve para traer toda la tabla de usuarios
        const [rows] = await db.query('SELECT * FROM clasificacion_de_usuarios');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM clasificacion_de_usuarios WHERE id_tipo_usuario  = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            categoria_usuario
        } = data;

        const [result] = await db.query('INSERT INTO clasificacion_de_usuarios (categoria_usuario) VALUES (?)',
            
            [categoria_usuario]);
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            categoria_usuario
        } = data;

        const [result] = await db.query('UPDATE clasificacion_de_usuarios SET categoria_usuario = ? WHERE id_tipo_usuario = ?',
            [ categoria_usuario, id]);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM clasificacion_de_usuarios WHERE id_tipo_usuario = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = catUser;
