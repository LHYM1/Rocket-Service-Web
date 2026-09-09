import db from '../../config/db.js';

const categoria = {
   
    findAll: async () => {
        const query = ('SELECT * FROM categoria');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM categoria WHERE id_categoria = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            nombre, 
            descripcion
        } = data;

        const [result] = await db.query(
            `INSERT INTO categoria
            
            (nombre, descripcion)

            VALUES (?, ?)`,
            [
                nombre, descripcion
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre, 
            descripcion
        } = data;

        const [result] = await db.query(
            `UPDATE categoria
             SET nombre = ?, descripcion = ?

             WHERE id_categoria = ?`,
            [
                nombre, 
                descripcion,
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM categoria WHERE id_categoria = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default categoria;