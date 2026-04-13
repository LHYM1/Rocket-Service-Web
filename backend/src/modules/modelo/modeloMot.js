import db from '../../config/db.js';

const modeloMot = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = ('SELECT * FROM modelo');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM modelo WHERE id_modelo  = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            nombre
        } = data;

        const [result] = await db.query(
            `INSERT INTO modelo
            (nombre) VALUES (?)`, [nombre]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre
        } = data;

        const [result] = await db.query(
            `UPDATE modelo
             SET nombre = ?

             WHERE id_modelo  = ?`,
             [nombre, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM modelo WHERE id_modelo = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default modeloMot;