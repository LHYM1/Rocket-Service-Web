import db from '../../config/db.js';

const OrdenServicio = {
    // HU-006.2 -- Listar con nombres reales (arregla el bug de "No definido")
    findAll: async ({ codigo_orden, estado, id_tecnico } = {}) => {
        let query = `
            SELECT
                o.id_orden,
                o.codigo_orden,
                CONCAT(cli.nombre, ' ', cli.apellido) AS nombre_cliente,
                m.placa AS placa_moto,
                mo.nombre AS nombre_modelo,
                CONCAT(t.nombre, ' ', t.apellido) AS nombre_tecnico,
                o.id_tecnico_asignado,
                ts.nombre_servicio,
                o.id_tipo_servicio,
                e.nombre_estado,
                o.id_estado_de_servicio,
                o.fecha_de_creacion,
                o.fecha_finalizacion_estimada,
                o.descripcion_del_problema
            FROM ordenes_de_servicio o
            LEFT JOIN motocicleta m ON o.id_moto = m.id_moto
            LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
            LEFT JOIN usuarios cli ON o.id_usuario = cli.id_usuario
            LEFT JOIN usuarios t ON o.id_tecnico_asignado = t.id_usuario
            LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
            LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
            WHERE 1 = 1
        `;
        const params = [];

        if (codigo_orden) {
            query += ` AND o.codigo_orden LIKE ?`;
            params.push(`%${codigo_orden}%`);
        }
        if (estado) {
            query += ` AND e.nombre_estado = ?`;
            params.push(estado);
        }
        if (id_tecnico) {
            query += ` AND o.id_tecnico_asignado = ?`;
            params.push(id_tecnico);
        }

        query += ` ORDER BY o.id_orden ASC`;

        const [rows] = await db.query(query, params);
        return rows;
    },

    // HU-006.2 -- Técnico: solo sus órdenes asignadas
    findAllByTecnico: async (id_tecnico, { codigo_orden, estado } = {}) => {
        let query = `
            SELECT
                o.id_orden,
                o.codigo_orden,
                CONCAT(cli.nombre, ' ', cli.apellido) AS nombre_cliente,
                m.placa AS placa_moto,
                mo.nombre AS nombre_modelo,
                CONCAT(t.nombre, ' ', t.apellido) AS nombre_tecnico,
                ts.nombre_servicio,
                o.id_tipo_servicio,
                e.nombre_estado,
                o.id_estado_de_servicio,
                o.fecha_de_creacion,
                o.fecha_finalizacion_estimada,
                o.descripcion_del_problema
            FROM ordenes_de_servicio o
            LEFT JOIN motocicleta m ON o.id_moto = m.id_moto
            LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
            LEFT JOIN usuarios cli ON o.id_usuario = cli.id_usuario
            LEFT JOIN usuarios t ON o.id_tecnico_asignado = t.id_usuario
            LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
            LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
            WHERE o.id_tecnico_asignado = ?
        `;
        const params = [id_tecnico];

        if (codigo_orden) {
            query += ` AND o.codigo_orden LIKE ?`;
            params.push(`%${codigo_orden}%`);
        }
        if (estado) {
            query += ` AND e.nombre_estado = ?`;
            params.push(estado);
        }

        query += ` ORDER BY o.id_orden ASC`;

        const [rows] = await db.query(query, params);
        return rows;
    },

    // HU-006.2 / HU-006.10 -- Cliente: solo sus propias órdenes
    findAllByCliente: async (id_cliente) => {
        const [rows] = await db.query(
            `SELECT
                o.id_orden,
                o.codigo_orden,
                m.placa AS placa_moto,
                mo.nombre AS nombre_modelo,
                CONCAT(t.nombre, ' ', t.apellido) AS nombre_tecnico,
                ts.nombre_servicio,
                o.id_tipo_servicio,
                e.nombre_estado,
                o.id_estado_de_servicio,
                o.fecha_de_creacion,
                o.fecha_finalizacion_estimada,
                o.descripcion_del_problema
             FROM ordenes_de_servicio o
             LEFT JOIN motocicleta m ON o.id_moto = m.id_moto
             LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
             LEFT JOIN usuarios t ON o.id_tecnico_asignado = t.id_usuario
             LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
             LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
             WHERE o.id_usuario = ?
             ORDER BY o.id_orden ASC`,
            [id_cliente]
        );
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(
            `SELECT o.*, e.nombre_estado
             FROM ordenes_de_servicio o
             LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
             WHERE o.id_orden = ?`,
            [id]
        );
        return rows[0];
    },

    // RN-003 (HU-006.1): código automático formato ORD-XXX
    generarCodigoOrden: async () => {
        const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ordenes_de_servicio`);
        const siguiente = rows[0].total + 1;
        return `ORD-${String(siguiente).padStart(3, '0')}`;
    },

    getEstadoIdPorNombre: async (nombre) => {
        const [rows] = await db.query(
            `SELECT id_estado_de_servicio FROM estado_de_orden_de_servicio WHERE nombre_estado = ?`,
            [nombre]
        );
        return rows[0]?.id_estado_de_servicio || null;
    },

    // Para el selector del formulario de creación: lista de técnicos disponibles ahora mismo
    getTecnicosDisponibles: async () => {
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.apellido
             FROM usuarios u
             JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario
             WHERE c.categoria_usuario = 'Técnico' AND u.estado = 1
             AND NOT EXISTS (
                 SELECT 1 FROM registro_actividad ra
                 WHERE ra.id_usuario = u.id_usuario
                 AND ra.id_registro = (
                     SELECT MAX(id_registro) FROM registro_actividad WHERE id_usuario = u.id_usuario
                 )
                 AND ra.estado_disponibilidad != 'Disponible'
             )`
        );
        return rows;
    },

    // RN-006 (HU-006.1): validar que el técnico exista, tenga rol Técnico, esté activo
    // y su disponibilidad actual (último registro en registro_actividad) sea "Disponible".
    // Si el técnico aún no tiene ningún registro, se considera disponible por defecto.
    esTecnicoValido: async (id_usuario) => {
        const [rows] = await db.query(
            `SELECT u.id_usuario FROM usuarios u
             JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario
             WHERE u.id_usuario = ? AND c.categoria_usuario = 'Técnico' AND u.estado = 1`,
            [id_usuario]
        );
        if (rows.length === 0) return false;

        const [disponibilidad] = await db.query(
            `SELECT estado_disponibilidad FROM registro_actividad
             WHERE id_usuario = ? ORDER BY id_registro DESC LIMIT 1`,
            [id_usuario]
        );

        if (disponibilidad.length === 0) return true; // sin registro previo = disponible por defecto
        return disponibilidad[0].estado_disponibilidad === 'Disponible';
    },

    // HU-006.1 -- Crear (código y estado ASIGNADA generados por el sistema, no por el cliente)
    create: async (data) => {
        const {
            codigo_orden,
            id_moto,
            id_usuario,
            id_tecnico_asignado,
            id_tipo_servicio,
            id_estado_de_servicio,
            fecha_finalizacion_estimada,
            descripcion_del_problema,
            fecha_de_creacion // opcional: si viene de una pre-revisión, se usa esa misma fecha
        } = data;

        if (fecha_de_creacion) {
            const [result] = await db.query(
                `INSERT INTO ordenes_de_servicio
                (codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio,
                fecha_finalizacion_estimada, descripcion_del_problema, fecha_de_creacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    codigo_orden, id_moto, id_usuario, id_tecnico_asignado,
                    id_tipo_servicio, id_estado_de_servicio, fecha_finalizacion_estimada,
                    descripcion_del_problema, fecha_de_creacion
                ]
            );
            return result.insertId;
        }

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

    // HU-006.3 -- Actualizar (los campos permitidos ya se filtraron en el controller según el rol)
    update: async (id, data) => {
        const campos = [];
        const valores = [];

        for (const [campo, valor] of Object.entries(data)) {
            campos.push(`${campo} = ?`);
            valores.push(valor);
        }
        if (campos.length === 0) return false;

        valores.push(id);
        const [result] = await db.query(
            `UPDATE ordenes_de_servicio SET ${campos.join(', ')} WHERE id_orden = ?`,
            valores
        );
        return result.affectedRows > 0;
    },

    // HU-006.4 -- Cancelar (no elimina: cambia el estado a CANCELADA)
    cancelar: async (id, idEstadoCancelada) => {
        const [result] = await db.query(
            `UPDATE ordenes_de_servicio SET id_estado_de_servicio = ? WHERE id_orden = ?`,
            [idEstadoCancelada, id]
        );
        return result.affectedRows > 0;
    },

    // HU-006.7 -- Cambiar de estado (usado por las 3 transiciones del Técnico)
    cambiarEstado: async (id, idEstadoNuevo) => {
        const [result] = await db.query(
            `UPDATE ordenes_de_servicio SET id_estado_de_servicio = ? WHERE id_orden = ?`,
            [idEstadoNuevo, id]
        );
        return result.affectedRows > 0;
    },

    // HU-006.10: guarda el motivo de rechazo del cliente (cancelación o reajuste)
    guardarMotivoRechazo: async (id, motivo) => {
        await db.query(`UPDATE ordenes_de_servicio SET motivo_rechazo = ? WHERE id_orden = ?`, [motivo, id]);
    },

    // RN-005 (HU-006.7): al finalizar, el técnico queda disponible automáticamente
    marcarTecnicoDisponible: async (id_tecnico, id_orden) => {
        await db.query(
            `INSERT INTO registro_actividad (codigo_registro, id_orden, id_usuario, estado_disponibilidad)
             VALUES (?, ?, ?, 'Disponible')`,
            [`REG-${Date.now()}`, id_orden, id_tecnico]
        );
    },

    // Disponibilidad automática, sin orden asociada (por ejemplo, al empezar/terminar una pre-revisión)
    marcarDisponibilidad: async (id_tecnico, estado) => {
        await db.query(
            `INSERT INTO registro_actividad (codigo_registro, id_orden, id_usuario, estado_disponibilidad)
             VALUES (?, NULL, ?, ?)`,
            [`REG-${Date.now()}`, id_tecnico, estado]
        );
    },

    // RN de HU-006.4: los insumos ya asociados a la orden vuelven al stock
    devolverInsumosAlStock: async (id_orden) => {
        const [insumosUsados] = await db.query(
            `SELECT id_insumo, cantidad FROM insumos_usados_en_servicio WHERE id_orden = ?`,
            [id_orden]
        );
        for (const item of insumosUsados) {
            await db.query(
                `UPDATE insumos SET cantidad_disponible = cantidad_disponible + ?, estado = 1 WHERE id_insumo = ?`,
                [item.cantidad, item.id_insumo]
            );
        }
    },

    // RN de HU-006.4: la moto asociada se desactiva al cancelar
    desactivarMoto: async (id_moto) => {
        await db.query(`UPDATE motocicleta SET estado = 0 WHERE id_moto = ?`, [id_moto]);
    }
};

export default OrdenServicio;