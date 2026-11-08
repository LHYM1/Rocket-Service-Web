import db from '../../config/db.js';

const calificaciones = {
    yaCalifico: async (id_orden) => {
        const [rows] = await db.query(
            `SELECT id_calificacion FROM calificaciones_tecnicos WHERE id_orden = ?`,
            [id_orden]
        );
        return rows.length > 0;
    },

    crear: async ({ id_orden, id_tecnico, id_usuario, calificacion, comentario }) => {
        const [result] = await db.query(
            `INSERT INTO calificaciones_tecnicos (id_orden, id_tecnico, id_usuario, calificacion, comentario)
             VALUES (?, ?, ?, ?, ?)`,
            [id_orden, id_tecnico, id_usuario, calificacion, comentario || null]
        );
        return result.insertId;
    },

    // RN-005: promedio del técnico (para dashboard y perfil)
    promedioPorTecnico: async (id_tecnico) => {
        const [rows] = await db.query(
            `SELECT ROUND(AVG(calificacion), 1) AS promedio, COUNT(*) AS total
             FROM calificaciones_tecnicos WHERE id_tecnico = ?`,
            [id_tecnico]
        );
        return rows[0];
    },

    findByOrden: async (id_orden) => {
        const [rows] = await db.query(
            `SELECT * FROM calificaciones_tecnicos WHERE id_orden = ?`,
            [id_orden]
        );
        return rows[0] || null;
    }
};

export default calificaciones;