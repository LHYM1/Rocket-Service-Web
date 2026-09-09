import db from '../../config/db.js';

const preRevision = {
    esTecnicoValido: async (id_usuario) => {
        const [rows] = await db.query(
            `SELECT u.id_usuario FROM usuarios u
             JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario
             WHERE u.id_usuario = ? AND c.categoria_usuario = 'Técnico' AND u.estado = 2`,
            [id_usuario]
        );
        if (rows.length === 0) return false;

        const [disponibilidad] = await db.query(
            `SELECT estado_disponibilidad FROM registro_actividad
             WHERE id_usuario = ? ORDER BY id_registro DESC LIMIT 1`,
            [id_usuario]
        );
        if (disponibilidad.length === 0) return true;
        return disponibilidad[0].estado_disponibilidad === 'Disponible';
    },

    // RN-001: Admin crea la pre-revisión (cliente + técnico + fecha)
    create: async ({ id_usuario, id_moto, id_tecnico_asignado, fecha_pre_revision }) => {
        const [result] = await db.query(
            `INSERT INTO pre_revision (id_usuario, id_moto, id_tecnico_asignado, fecha_pre_revision, estado)
             VALUES (?, ?, ?, ?, 'PENDIENTE')`,
            [id_usuario, id_moto, id_tecnico_asignado, fecha_pre_revision]
        );
        return result.insertId;
    },

    // Disponibilidad automática del técnico (sin orden asociada)
    marcarDisponibilidad: async (id_tecnico, estado) => {
        await db.query(
            `INSERT INTO registro_actividad (codigo_registro, id_orden, id_usuario, estado_disponibilidad)
             VALUES (?, NULL, ?, ?)`,
            [`REG-${Date.now()}`, id_tecnico, estado]
        );
    },

    findAllAdmin: async ({ estado } = {}) => {
        let query = `
            SELECT
                pr.id_pre_revision, pr.fecha_pre_revision, pr.estado, pr.resultado,
                pr.id_orden_generada, pr.id_moto, pr.id_tipo_servicio,
                CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
                CONCAT(t.nombre, ' ', t.apellido) AS tecnico,
                m.placa
            FROM pre_revision pr
            JOIN usuarios cli ON pr.id_usuario = cli.id_usuario
            JOIN usuarios t ON pr.id_tecnico_asignado = t.id_usuario
            JOIN motocicleta m ON pr.id_moto = m.id_moto
            WHERE 1 = 1
        `;
        const params = [];
        if (estado) {
            query += ` AND pr.estado = ?`;
            params.push(estado);
        }
        query += ` ORDER BY pr.id_pre_revision DESC`;
        const [rows] = await db.query(query, params);
        return rows;
    },

    // RN-007: "Mis pre-revisiones" del Técnico
    findAllByTecnico: async (id_tecnico) => {
        const [rows] = await db.query(
            `SELECT
                pr.id_pre_revision, pr.fecha_pre_revision, pr.estado, pr.resultado, pr.observaciones,
                pr.id_moto, pr.id_tipo_servicio, pr.id_orden_generada,
                CONCAT(cli.nombre, ' ', cli.apellido) AS cliente,
                m.placa
             FROM pre_revision pr
             JOIN usuarios cli ON pr.id_usuario = cli.id_usuario
             JOIN motocicleta m ON pr.id_moto = m.id_moto
             WHERE pr.id_tecnico_asignado = ?
             ORDER BY pr.id_pre_revision DESC`,
            [id_tecnico]
        );
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(`SELECT * FROM pre_revision WHERE id_pre_revision = ?`, [id]);
        if (rows.length === 0) return null;
        const [fotos] = await db.query(
            `SELECT id_foto, url_imagen FROM pre_revision_fotos WHERE id_pre_revision = ?`,
            [id]
        );
        return { ...rows[0], fotos };
    },

    contarFotos: async (id) => {
        const [rows] = await db.query(
            `SELECT COUNT(*) AS total FROM pre_revision_fotos WHERE id_pre_revision = ?`,
            [id]
        );
        // PostgreSQL devuelve COUNT(*) como texto -- se convierte para evitar
        // errores si en algún punto se suma o compara aritméticamente
        return Number(rows[0].total);
    },

    agregarFoto: async (id_pre_revision, url_imagen) => {
        const [result] = await db.query(
            `INSERT INTO pre_revision_fotos (id_pre_revision, url_imagen) VALUES (?, ?)`,
            [id_pre_revision, url_imagen]
        );
        return result.insertId;
    },

    eliminarFoto: async (id_foto) => {
        const [result] = await db.query(
            `DELETE FROM pre_revision_fotos WHERE id_foto = ?`,
            [id_foto]
        );
        return result.affectedRows > 0;
    },

    // RN-004 / RN-005: el Técnico completa el resultado
    completar: async (id, { observaciones, id_tipo_servicio, resultado, nuevoEstado }) => {
        const [result] = await db.query(
            `UPDATE pre_revision
             SET observaciones = ?, id_tipo_servicio = ?, resultado = ?, estado = ?
             WHERE id_pre_revision = ?`,
            [observaciones, id_tipo_servicio, resultado, nuevoEstado, id]
        );
        return result.affectedRows > 0;
    },

    // CA-007 (HU-006.1): las pre-revisiones ya completadas con "Requiere reparación"
    // que aún no tienen orden generada -- es la "notificación" para el Admin
    findPendientesDeOrden: async () => {
        const [rows] = await db.query(
            `SELECT pr.id_pre_revision, CONCAT(cli.nombre, ' ', cli.apellido) AS cliente
             FROM pre_revision pr
             JOIN usuarios cli ON pr.id_usuario = cli.id_usuario
             WHERE pr.estado = 'COMPLETADA' AND pr.resultado = 'Requiere reparación'
             AND pr.id_orden_generada IS NULL`
        );
        return rows;
    },

    marcarOrdenGenerada: async (id_pre_revision, id_orden) => {
        await db.query(
            `UPDATE pre_revision SET id_orden_generada = ? WHERE id_pre_revision = ?`,
            [id_orden, id_pre_revision]
        );
    },

    // Utilidad para pruebas: eliminar una pre-revisión que aún no se completó
    eliminar: async (id) => {
        const [result] = await db.query(
            `DELETE FROM pre_revision WHERE id_pre_revision = ? AND estado = 'PENDIENTE'`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default preRevision;