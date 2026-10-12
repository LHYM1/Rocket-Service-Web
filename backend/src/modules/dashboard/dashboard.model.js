import db from '../../config/db.js';

const dashboard = {
    contarOrdenesPorEstado: async () => {
        const [rows] = await db.query(`
            SELECT e.nombre_estado, COUNT(*) AS total
            FROM ordenes_de_servicio o
            JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
            GROUP BY e.nombre_estado
        `);
        return rows;
    },

    ordenesRecientes: async (limite = 8) => {
        const [rows] = await db.query(`
            SELECT
                o.id_orden, o.codigo_orden, o.fecha_de_creacion, o.motivo_rechazo,
                CONCAT(cli.nombre, ' ', cli.apellido) AS nombre_cliente,
                CONCAT(t.nombre, ' ', t.apellido) AS nombre_tecnico,
                ts.nombre_servicio,
                e.nombre_estado
            FROM ordenes_de_servicio o
            LEFT JOIN usuarios cli ON o.id_usuario = cli.id_usuario
            LEFT JOIN usuarios t ON o.id_tecnico_asignado = t.id_usuario
            LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
            LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
            ORDER BY o.id_orden DESC
            LIMIT ?
        `, [limite]);
        return rows;
    },

    // Técnicos con su disponibilidad más reciente (o "Disponible" por defecto si nunca ha tenido registro)
    tecnicosConDisponibilidad: async () => {
        const [rows] = await db.query(`
            SELECT u.id_usuario, u.nombre, u.apellido,
                COALESCE(
                    (SELECT ra.estado_disponibilidad FROM registro_actividad ra
                     WHERE ra.id_usuario = u.id_usuario
                     ORDER BY ra.id_registro DESC LIMIT 1),
                    'Disponible'
                ) AS disponibilidad
            FROM usuarios u
            JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario
            WHERE c.categoria_usuario = 'Técnico' AND u.estado = 2
        `);
        return rows;
    },

    // Promedio, total, y TODAS las reseñas individuales de cada técnico calificado
    // (json_agg empaqueta cada reseña en un array, para poder desplegarlas todas en el Dashboard)
    resumenCalificaciones: async () => {
        const [rows] = await db.query(`
            SELECT
                t.id_usuario AS id_tecnico,
                CONCAT(t.nombre, ' ', t.apellido) AS nombre_tecnico,
                ROUND(AVG(cal.calificacion), 1) AS promedio,
                COUNT(cal.id_calificacion) AS total,
                json_agg(
                    json_build_object(
                        'calificacion', cal.calificacion,
                        'comentario', cal.comentario,
                        'fecha', cal.fecha_calificacion,
                        'codigo_orden', o.codigo_orden,
                        'nombre_cliente', CONCAT(cli.nombre, ' ', cli.apellido)
                    ) ORDER BY cal.fecha_calificacion DESC
                ) AS resenas
            FROM usuarios t
            JOIN clasificacion_de_usuarios cu ON t.id_tipo_usuario = cu.id_tipo_usuario
            LEFT JOIN calificaciones_tecnicos cal ON cal.id_tecnico = t.id_usuario
            LEFT JOIN ordenes_de_servicio o ON cal.id_orden = o.id_orden
            LEFT JOIN usuarios cli ON cal.id_usuario = cli.id_usuario
            WHERE cu.categoria_usuario = 'Técnico'
            GROUP BY t.id_usuario
            HAVING COUNT(cal.id_calificacion) > 0
            ORDER BY promedio DESC
        `);
        return rows;
    },

    // Resumen de Pre-revisiones: cuántas están pendientes, cuántas terminaron
    // requiriendo reparación (se volvieron orden), y cuántas no la necesitaron
    contarPreRevisiones: async () => {
        const [rows] = await db.query(`
            SELECT
                COUNT(*) FILTER (WHERE estado = 'PENDIENTE') AS pendientes,
                COUNT(*) FILTER (WHERE estado = 'COMPLETADA') AS requieren_reparacion,
                COUNT(*) FILTER (WHERE estado = 'FINALIZADA') AS no_requieren_reparacion,
                COUNT(*) AS total
            FROM pre_revision
        `);
        return rows[0];
    }
};

export default dashboard;