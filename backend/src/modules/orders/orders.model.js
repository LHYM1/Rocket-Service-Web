import db from '../../config/db.js';

const OrdenServicio = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = ('SELECT * FROM ordenes_de_servicio');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            codigo_orden, 
            id_moto,
            id_usuario,
            id_tecnico_asignado,
            id_tipo_servicio,
            id_estado_de_servicio,
            fecha_finalizacion_estimada,
            descripcion_del_problema

        } = data;

        const [result] = await db.query(
            `INSERT INTO ordenes_de_servicio
            
            (codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio,
            fecha_finalizacion_estimada, descripcion_del_problema)

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                codigo_orden, id_moto, id_usuario, id_tecnico_asignado,
                id_tipo_servicio, id_estado_de_servicio, fecha_finalizacion_estimada,
                descripcion_del_problema
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            codigo_orden, 
            id_moto,
            id_usuario,
            id_tecnico_asignado,
            id_tipo_servicio,
            id_estado_de_servicio,
            fecha_finalizacion_estimada,
            descripcion_del_problema 
        } = data;

        const [result] = await db.query(
            `UPDATE ordenes_de_servicio 
             SET codigo_orden = ?, id_moto = ?, 
             id_usuario = ?, id_tecnico_asignado = ?,
             id_tipo_servicio = ?, id_estado_de_servicio = ?,
             fecha_finalizacion_estimada = ?, descripcion_del_problema = ?

             WHERE id_orden = ?`,
            [
                codigo_orden, 
                id_moto,
                id_usuario,
                id_tecnico_asignado,
                id_tipo_servicio,
                id_estado_de_servicio,
                fecha_finalizacion_estimada,
                descripcion_del_problema,  
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return result.affectedRows > 0;
    },


      findAllDetalle: async () => {
        const query = `
            SELECT 
                o.id_orden,
                o.codigo_orden AS codigo,
                CONCAT(u.nombre, ' ', u.apellido) AS cliente,
                ts.nombre_servicio AS servicio,
                eos.nombre_estado AS estado,
                o.fecha_de_creacion AS fechaInicio,
                o.id_tecnico_asignado
            FROM ordenes_de_servicio o
            INNER JOIN motocicleta m ON o.id_moto = m.id_moto
            INNER JOIN usuarios u ON o.id_usuario = u.id_usuario
            INNER JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
            INNER JOIN estado_de_orden_de_servicio eos ON o.id_estado_de_servicio = eos.id_estado_de_servicio
            ORDER BY o.fecha_de_creacion DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Conteo de órdenes para las cards del dashboard
    getEstadisticas: async () => {
        const query = `
            SELECT
                COUNT(*) AS totales,
                SUM(CASE WHEN eos.nombre_estado NOT IN ('FINALIZADA', 'CANCELADA') THEN 1 ELSE 0 END) AS pendientes,
                SUM(CASE WHEN eos.nombre_estado = 'FINALIZADA' THEN 1 ELSE 0 END) AS finalizadas
            FROM ordenes_de_servicio o
            INNER JOIN estado_de_orden_de_servicio eos ON o.id_estado_de_servicio = eos.id_estado_de_servicio
        `;
        const [rows] = await db.query(query);
        return rows[0];
    },

    // Asigna un técnico a una orden y cambia su estado a "ASIGNADA"
    asignarTecnico: async (idOrden, idTecnico) => {
        const [result] = await db.query(
            `UPDATE ordenes_de_servicio o
             INNER JOIN estado_de_orden_de_servicio eos ON eos.nombre_estado = 'ASIGNADA'
             SET o.id_tecnico_asignado = ?, o.id_estado_de_servicio = eos.id_estado_de_servicio
             WHERE o.id_orden = ?`,
            [idTecnico, idOrden]
        );
        return result.affectedRows > 0;
    }


};

export default OrdenServicio;