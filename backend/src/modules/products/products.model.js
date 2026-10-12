import db from '../../config/db.js';

const product = {
    findAll: async () => { // Listar
        const [rows] = await db.query(
            `SELECT 
                p.id_insumo,
                ct.nombre AS categoria,
                ct.id_categoria,

                und.nombre AS unidad_de_medida,
                und.id_unidad,
                und.simbolo AS simbolo_unidad,
            
                p.nombre_insumo,
                p.cantidad_disponible,
                p.precio_unitario,
                p.estado

            FROM insumos p
            LEFT JOIN categoria ct ON p.id_categoria = ct.id_categoria
            LEFT JOIN unidad_de_medida und ON p.id_unidad = und.id_unidad
        `);
        return rows;
    },

    // consultar por id
    findById : async (id) => {
        const [rows] = await db.query(`SELECT * FROM insumos
        WHERE id_insumo  = ?`, [id]);
        return rows[0];
    },

    // RN-001 / CA-002 (registrar): buscar por nombre para validar unicidad
    findByNombre: async (nombre_insumo) => {
        const [rows] = await db.query(
            `SELECT id_insumo FROM insumos WHERE nombre_insumo = ?`,
            [nombre_insumo]
        );
        return rows[0];
    },

    // RN-003 / CA-003 (actualizar): nombre único, excluyendo el propio insumo
    findByNombreExcluyendo: async (nombre_insumo, id) => {
        const [rows] = await db.query(
            `SELECT id_insumo FROM insumos WHERE nombre_insumo = ? AND id_insumo != ?`,
            [nombre_insumo, id]
        );
        return rows[0];
    },

    // RN-002 / CA-005 (registrar) y RN-004 / CA-004 (actualizar): validar existencia y estado de la categoría
    getCategoriaPorId: async (id_categoria) => {
        const [rows] = await db.query(
            `SELECT id_categoria, estado FROM categoria WHERE id_categoria = ?`,
            [id_categoria]
        );
        return rows[0];
    },

    // crear (HU-004.1)
    create: async (data) => {
        const {
            id_categoria,
            id_unidad,
            nombre_insumo,
            cantidad_disponible,
            precio_unitario
        } = data;

        const [result] = await db.query(
            `INSERT INTO insumos (id_categoria, id_unidad, nombre_insumo, cantidad_disponible, precio_unitario, estado)
            VALUES (?, ?, ?, ?, ?, true)`,

            [id_categoria, id_unidad, nombre_insumo, cantidad_disponible, precio_unitario]
        );
        return result.insertId;
    },

    // actualizar (HU-004.3) — la cantidad SUMA a la existente (RN-005), el precio se reemplaza
    // directo (no suma), y reactiva automáticamente si el insumo estaba inactivo (RN-007 / HU-004.4)
    update : async (id, data) => {
        const {
            id_categoria,
            nombre_insumo,
            cantidad_a_agregar,
            precio_unitario
        } = data;

        const [rows] = await db.query(
            `SELECT cantidad_disponible, estado FROM insumos WHERE id_insumo = ?`,
            [id]
        );
        if (rows.length === 0) return false;
        const actual = rows[0];

        let nuevaCantidad = actual.cantidad_disponible;
        if (cantidad_a_agregar !== undefined && cantidad_a_agregar !== null && cantidad_a_agregar !== "") {
            nuevaCantidad = actual.cantidad_disponible + Number(cantidad_a_agregar);
        }

        // HU-004.4: automático — se reactiva si vuelve a haber stock, se desactiva si llega a cero
        let nuevoEstado = actual.estado;
        if (nuevaCantidad > 0) nuevoEstado = true;
        if (nuevaCantidad === 0) nuevoEstado = false;

        const [result] = await db.query(
            `UPDATE insumos SET id_categoria = ?, nombre_insumo = ?, cantidad_disponible = ?, precio_unitario = ?, estado = ?
             WHERE id_insumo = ?`,
            [id_categoria, nombre_insumo, nuevaCantidad, precio_unitario, nuevoEstado, id]
        );
        return result.affectedRows > 0;
    },

    // eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insumos WHERE id_insumo = ?`, [id]
        );
        return result.affectedRows > 0;
    },

    // HU-004.6 -- RN-001: insumos activos con stock bajo (entre 1 y 5 unidades)
    findStockBajo: async () => {
        const [rows] = await db.query(
            `SELECT id_insumo, nombre_insumo, cantidad_disponible
             FROM insumos
             WHERE cantidad_disponible > 0 AND cantidad_disponible <= 5 AND estado = true`
        );
        return rows;
    }

}; 

export default product;