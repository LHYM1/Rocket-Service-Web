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
             WHERE n.leida = 0
             ORDER BY n.fecha ASC`
        );
        return rows;
    },

    marcarTodasLeidas: async () => {
        await db.query(`UPDATE notificaciones SET leida = 1 WHERE leida = 0`);
    }
};

export default notificaciones;