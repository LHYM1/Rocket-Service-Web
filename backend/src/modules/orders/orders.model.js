import db from '../../config/db.js';

const OrdenServicio = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = (`
            SELECT o.id_orden,
                o.codigo_orden,
                m.placa,

                CONCAT(c.nombre, '', c.apellido) AS cliente,
                CONCAT(t.nombre, '', t.apellido) AS tecnico,

                o.descripcion_del_problema,
                e.nombre_estado,
                ts.nombre_servicio,

                o.fecha_de_creacion,
                o.fecha_finalizacion_estimada
            
            FROM ordenes_de_servicio o

            LEFT JOIN motocicleta m ON o.id_moto = m.id_moto
            LEFT JOIN usuarios c ON o.id_usuario = c.id_usuario AND c.id_tipo_usuario = 1
            LEFT JOIN usuarios t ON o.id_tecnico_asignado = t.id_usuario AND t.id_tipo_usuario = 2

            LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
            LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
            ORDER BY o.fecha_de_creacion DESC

        `);
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            descripcion_del_problema, 
            fecha_finalizacion_estimada
        } = data;

        const [result] = await db.query(
            `INSERT INTO ordenes_de_servicio 
            (descripcion_del_problema, fecha_finalizacion_estimada) 
            VALUES (?, ?)`,
            [descripcion_del_problema, fecha_finalizacion_estimada, ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            descripcion_del_problema, 
            fecha_finalizacion_estimada 
        } = data;

        const [result] = await db.query(
            `UPDATE ordenes_de_servicio 
             SET descripcion_del_problema = ?, fecha_finalizacion_estimada = ?, 
             WHERE id_orden = ?`,
            [descripcion_del_problema, fecha_finalizacion_estimada, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default OrdenServicio;