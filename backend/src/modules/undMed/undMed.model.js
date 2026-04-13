import db from '../../config/db.js';

const unidadMedida = {
  
    findAll: async () => {
        const query = ('SELECT * FROM unidad_de_medida');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM unidad_de_medida WHERE id_unidad = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            nombre
        } = data;

        const [result] = await db.query(
            `INSERT INTO unidad_de_medida
            
            (nombre)

            VALUES (?)`,
            [
               nombre
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre
        } = data;

        const [result] = await db.query(
            `UPDATE unidad_de_medida
             SET nombre = ?

             WHERE id_unidad = ?`,
            [
               nombre,
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM unidad_de_medida WHERE id_unidad = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default unidadMedida;