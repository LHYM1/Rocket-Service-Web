import db from '../../config/db.js';

const prodtsUseService = {
    // RN-001: Admin ve todo, con técnico asignado
    findAllAdmin: async ({ id_orden, tecnico }) => {
        let query = `
            SELECT
                iu.id_insumos_orden,
                o.codigo_orden,
                o.id_orden,
                CONCAT(t.nombre, ' ', t.apellido) AS tecnico_nombre,
                ct.nombre AS categoria,
                i.nombre_insumo,
                i.id_insumo,
                und.nombre AS nombre_unidad,
                iu.cantidad,
                iu.precio_unitario_snapshot
            FROM insumos_usados_en_servicio iu
            JOIN ordenes_de_servicio o ON iu.id_orden = o.id_orden
            JOIN insumos i ON iu.id_insumo = i.id_insumo
            JOIN categoria ct ON i.id_categoria = ct.id_categoria
            LEFT JOIN unidad_de_medida und ON i.id_unidad = und.id_unidad
            LEFT JOIN usuarios t ON o.id_tecnico_asignado = t.id_usuario
            WHERE 1 = 1
        `;
        const params = [];

        if (id_orden) {
            query += ` AND o.codigo_orden LIKE ?`;
            params.push(`%${id_orden}%`);
        }
        if (tecnico) {
            query += ` AND CONCAT(t.nombre, ' ', t.apellido) LIKE ?`;
            params.push(`%${tecnico}%`);
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    // RN-002: Técnico ve solo lo de sus propias órdenes, sin columna de técnico
    findAllTecnico: async (id_tecnico, { id_orden }) => {
        let query = `
            SELECT
                iu.id_insumos_orden,
                o.codigo_orden,
                o.id_orden,
                ct.nombre AS categoria,
                i.nombre_insumo,
                i.id_insumo,
                und.nombre AS nombre_unidad,
                iu.cantidad,
                iu.precio_unitario_snapshot
            FROM insumos_usados_en_servicio iu
            JOIN ordenes_de_servicio o ON iu.id_orden = o.id_orden
            JOIN insumos i ON iu.id_insumo = i.id_insumo
            JOIN categoria ct ON i.id_categoria = ct.id_categoria
            LEFT JOIN unidad_de_medida und ON i.id_unidad = und.id_unidad
            WHERE o.id_tecnico_asignado = ?
        `;
        const params = [id_tecnico];

        if (id_orden) {
            query += ` AND o.codigo_orden LIKE ?`;
            params.push(`%${id_orden}%`);
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    // ── HU-006.9: agregar / quitar insumos de una orden (Cotización) ──

    // RN-004 / CA-002: un mismo insumo no puede agregarse dos veces a la misma orden
    yaEstaAgregado: async (id_orden, id_insumo) => {
        const [rows] = await db.query(
            `SELECT id_insumos_orden FROM insumos_usados_en_servicio WHERE id_orden = ? AND id_insumo = ?`,
            [id_orden, id_insumo]
        );
        return rows.length > 0;
    },

    // RN-002: insumo activo y con stock disponible (reutiliza la tabla insumos)
    getInsumoActivo: async (id_insumo) => {
        const [rows] = await db.query(
            `SELECT id_insumo, cantidad_disponible, precio_unitario, estado FROM insumos WHERE id_insumo = ?`,
            [id_insumo]
        );
        return rows[0] || null;
    },

    // RN-005: el precio se congela (snapshot) al momento de agregar
    agregarInsumoAOrden: async (id_orden, id_insumo, cantidad, precio_snapshot) => {
        await db.query(
            `INSERT INTO insumos_usados_en_servicio (id_orden, id_insumo, cantidad, precio_unitario_snapshot)
             VALUES (?, ?, ?, ?)`,
            [id_orden, id_insumo, cantidad, precio_snapshot]
        );
        await db.query(
            `UPDATE insumos SET cantidad_disponible = cantidad_disponible - ? WHERE id_insumo = ?`,
            [cantidad, id_insumo]
        );
    },

    findInsumoUsadoPorId: async (id_insumos_orden) => {
        const [rows] = await db.query(
            `SELECT * FROM insumos_usados_en_servicio WHERE id_insumos_orden = ?`,
            [id_insumos_orden]
        );
        return rows[0] || null;
    },

    // RN-006: al quitar un insumo, la cantidad vuelve al stock
    quitarInsumoDeOrden: async (id_insumos_orden, id_insumo, cantidad) => {
        await db.query(`DELETE FROM insumos_usados_en_servicio WHERE id_insumos_orden = ?`, [id_insumos_orden]);
        await db.query(
            `UPDATE insumos SET cantidad_disponible = cantidad_disponible + ?, estado = 1 WHERE id_insumo = ?`,
            [cantidad, id_insumo]
        );
    },

    // Total cotizado de una orden (para mostrarle al Cliente en HU-006.10)
    totalCotizado: async (id_orden) => {
        const [rows] = await db.query(
            `SELECT COALESCE(SUM(cantidad * precio_unitario_snapshot), 0) AS total
             FROM insumos_usados_en_servicio WHERE id_orden = ?`,
            [id_orden]
        );
        return rows[0].total;
    },

    // Insumos cotizados de UNA orden puntual (por id exacto, no búsqueda difusa)
    findInsumosDeOrden: async (id_orden) => {
        const [rows] = await db.query(
            `SELECT iu.id_insumos_orden, i.id_insumo, i.nombre_insumo, iu.cantidad, iu.precio_unitario_snapshot,
                    und.nombre AS nombre_unidad
             FROM insumos_usados_en_servicio iu
             JOIN insumos i ON iu.id_insumo = i.id_insumo
             LEFT JOIN unidad_de_medida und ON i.id_unidad = und.id_unidad
             WHERE iu.id_orden = ?`,
            [id_orden]
        );
        return rows;
    },

    // Ajustar la cantidad de un insumo ya agregado (+ / -), devolviendo o descontando
    // stock según la diferencia, sin necesidad de quitar y volver a agregar
    actualizarCantidad: async (id_insumos_orden, nuevaCantidad, id_insumo, cantidadActual) => {
        const diferencia = nuevaCantidad - cantidadActual;
        await db.query(
            `UPDATE insumos_usados_en_servicio SET cantidad = ? WHERE id_insumos_orden = ?`,
            [nuevaCantidad, id_insumos_orden]
        );
        // Si aumentó, se descuenta la diferencia del stock; si bajó, se le devuelve
        await db.query(
            `UPDATE insumos SET cantidad_disponible = cantidad_disponible - ? WHERE id_insumo = ?`,
            [diferencia, id_insumo]
        );
    }
};

export default prodtsUseService;