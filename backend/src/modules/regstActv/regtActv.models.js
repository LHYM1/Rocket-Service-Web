import db from '../../config/db.js';

const registroActv = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = ('SELECT * FROM registro_actividad');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM registro_actividad WHERE 	id_registro = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            codigo_registro, 
            id_orden,
            id_usuario,
            estado_disponibilidad

        } = data;

        const [result] = await db.query(
            `INSERT INTO registro_actividad
            
            (codigo_registro, id_orden, id_usuario, estado_disponibilidad)

            VALUES (?, ?, ?, ?)`,
            [
                codigo_registro, id_orden, 
                id_usuario, estado_disponibilidad,
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            codigo_registro, 
            id_orden,
            id_usuario,
            estado_disponibilidad
        } = data;

        const [result] = await db.query(
            `UPDATE registro_actividad 
             SET codigo_registro = ?, id_orden = ?, 
             id_usuario = ?, estado_disponibilidad = ?

             WHERE id_registro = ?`,
            [
                codigo_registro, 
                id_orden,
                id_usuario,
                estado_disponibilidad,
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM registro_actividad WHERE id_registro = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default registroActv;