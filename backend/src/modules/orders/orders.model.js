const db = require('../../config/db');

const OrdenServicio = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = `
            SELECT o.*, 
                   u.nombre AS nombre_tecnico, 
                   e.nombre_estado AS estado_nombre
            FROM ordenes_de_servicio o
            LEFT JOIN usuarios u ON o.id_tecnico_asignado = u.id_usuario
            LEFT JOIN estados_servicio e ON o.id_estado_de_servicio = e.id_estado
            ORDER BY o.fecha_creacion DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            codigo_orden, id_moto, id_usuario, id_tecnico_asignado, 
            id_tipo_servicio, id_estado_de_servicio, descripcion_del_problema, 
            fecha_finalizacion_estimada, costo_total_final 
        } = data;

        const [result] = await db.query(
            `INSERT INTO ordenes_de_servicio 
            (codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, 
             id_estado_de_servicio, descripcion_del_problema, fecha_finalizacion_estimada, costo_total_final) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, 
             id_estado_de_servicio, descripcion_del_problema, fecha_finalizacion_estimada, costo_total_final]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            id_tecnico_asignado, id_estado_de_servicio, descripcion_del_problema, 
            fecha_finalizacion_estimada, costo_total_final 
        } = data;

        const [result] = await db.query(
            `UPDATE ordenes_de_servicio 
             SET id_tecnico_asignado = ?, id_estado_de_servicio = ?, 
                 descripcion_del_problema = ?, fecha_finalizacion_estimada = ?, 
                 costo_total_final = ? 
             WHERE id_orden = ?`,
            [id_tecnico_asignado, id_estado_de_servicio, descripcion_del_problema, 
             fecha_finalizacion_estimada, costo_total_final, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = OrdenServicio;