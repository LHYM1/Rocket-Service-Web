import db from '../../config/db.js';

const registroActv = {
    // Traer todos los registros con el código de la orden y el nombre del técnico (JOIN real)
    findAll: async () => {
        const query = `
            SELECT 
                ra.*,
                o.codigo_orden,
                u.nombre AS nombre_tecnico,
                u.apellido AS apellido_tecnico
            FROM registro_actividad ra
            LEFT JOIN ordenes_de_servicio o ON ra.id_orden = o.id_orden
            LEFT JOIN usuarios u ON ra.id_usuario = u.id_usuario
            ORDER BY ra.id_registro DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM registro_actividad WHERE id_registro = ?', [id]);
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