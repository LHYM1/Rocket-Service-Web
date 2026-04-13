import db from '../../config/db.js';

const estdOrden = {
  
    findAll: async () => {
        const query = ('SELECT * FROM estado_de_orden_de_servicio');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM estado_de_orden_de_servicio WHERE id_estado_de_servicio  = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            nombre_estado
        } = data;

        const [result] = await db.query(
            `INSERT INTO estado_de_orden_de_servicio
            
            (nombre_estado)

            VALUES (?)`,
            [
               nombre_estado
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre_estado
        } = data;

        const [result] = await db.query(
            `UPDATE estado_de_orden_de_servicio
             SET nombre_estado = ?

             WHERE id_estado_de_servicio = ?`,
            [
               nombre_estado,
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM estado_de_orden_de_servicio WHERE id_estado_de_servicio = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default estdOrden;