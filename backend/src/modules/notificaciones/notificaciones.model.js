import db from '../../config/db.js';

const notificaciones = {
    crear: async (id_usuario_origen, mensaje) => {
        await db.query(
            `INSERT INTO notificaciones (id_usuario_origen, mensaje) VALUES (?, ?)`,
            [id_usuario_origen, mensaje]
        );
    },

    // Notificaciones sin leer, dirigidas a todos los Administradores
    listarNoLeidasParaAdmin: async () => {
        const [rows] = await db.query(
            `SELECT n.id_notificacion, n.mensaje, n.fecha, CONCAT(u.nombre, ' ', u.apellido) AS origen
             FROM notificaciones n
             JOIN usuarios u ON n.id_usuario_origen = u.id_usuario
             WHERE n.leida = false
             ORDER BY n.fecha ASC`
        );
        return rows;
    },

    marcarTodasLeidas: async () => {
        await db.query(`UPDATE notificaciones SET leida = true WHERE leida = false`);
    },

    // ── Notificaciones ligadas a una orden (ej. "el técnico agregó una foto") ──

    crearParaOrden: async ({ id_usuario_origen, id_usuario_destino, mensaje, id_orden }) => {
        await db.query(
            `INSERT INTO notificaciones (id_usuario_origen, id_usuario_destino, mensaje, id_orden)
             VALUES (?, ?, ?, ?)`,
            [id_usuario_origen, id_usuario_destino, mensaje, id_orden]
        );
    },

    // Cuántas notificaciones sin leer tiene el Cliente, agrupadas por orden
    // (para mostrar el numerito rojo en el botón "Evidencias" de cada card)
    contarNoLeidasPorOrden: async (id_usuario_destino) => {
        const [rows] = await db.query(
            `SELECT id_orden, COUNT(*) AS cantidad
             FROM notificaciones
             WHERE id_usuario_destino = ? AND leida = false AND id_orden IS NOT NULL
             GROUP BY id_orden`,
            [id_usuario_destino]
        );
        // PostgreSQL devuelve COUNT(*) como texto -- se convierte a número aquí
        return rows.map(r => ({ id_orden: r.id_orden, cantidad: Number(r.cantidad) }));
    },

    marcarLeidasDeOrden: async (id_usuario_destino, id_orden) => {
        await db.query(
            `UPDATE notificaciones SET leida = true
             WHERE id_usuario_destino = ? AND id_orden = ? AND leida = false`,
            [id_usuario_destino, id_orden]
        );
    }
};

export default notificaciones;