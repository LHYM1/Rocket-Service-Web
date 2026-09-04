import db from '../../config/db.js';

const product = {

    // Listar todos
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT 
                p.id_insumo,
                ct.nombre AS categoria,
                ct.id_categoria,
                und.nombre AS unidad_de_medida,
                und.id_unidad,
                p.nombre_insumo,
                p.cantidad_disponible,
                p.precio_unitario,
                p.estado
            FROM insumos p
            LEFT JOIN categoria ct ON p.id_categoria = ct.id_categoria
            LEFT JOIN unidad_de_medida und ON p.id_unidad = und.id_unidad
            ORDER BY p.nombre_insumo ASC
        `);
        return rows;
    },


    // Cuenta cuántas veces el insumo aparece usado en órdenes
    contarUsosEnOrdenes: async (id) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM insumos_usados_en_servicio WHERE id_insumo = ?', [id]
        );
        return rows[0].total;
    },    

    // Buscar por nombre (para validar duplicados)
    findByNombre: async (nombre_insumo, excludeId = null) => {
        let query = `SELECT * FROM insumos WHERE UPPER(nombre_insumo) = UPPER(?)`;
        let params = [nombre_insumo];

        if (excludeId) {
            query += ` AND id_insumo != ?`;
            params.push(excludeId);
        }

        const [rows] = await db.query(query, params);
        return rows[0];
    },

    // Consultar por id
    findById: async (id) => {
        const [rows] = await db.query(
            `SELECT * FROM insumos WHERE id_insumo = ?`, [id]
        );
        return rows[0];
    },

    // Crear
    create: async (data) => {
        const {
            id_categoria,
            id_unidad,
            nombre_insumo,
            cantidad_disponible,
            precio_unitario
        } = data;

        // Normalizar nombre a mayúsculas
        const nombreNormalizado = nombre_insumo.trim().toUpperCase();

        const [result] = await db.query(
            `INSERT INTO insumos 
            (id_categoria, id_unidad, nombre_insumo, cantidad_disponible, precio_unitario, estado) 
            VALUES (?, ?, ?, ?, ?, 1)`,
            [id_categoria, id_unidad, nombreNormalizado, cantidad_disponible, precio_unitario]
        );
        return result.insertId;
    },

    // Actualizar
    update: async (id, data) => {
        const {
            id_categoria,
            nombre_insumo,
            cantidad_adicional,
            precio_unitario
        } = data;

        // Normalizar nombre a mayúsculas
        const nombreNormalizado = nombre_insumo.trim().toUpperCase();

        // Obtener cantidad actual
        const [rows] = await db.query(
            `SELECT cantidad_disponible FROM insumos WHERE id_insumo = ?`, [id]
        );
        const cantidadActual = rows[0]?.cantidad_disponible || 0;
        const nuevaCantidad = cantidadActual + (parseInt(cantidad_adicional) || 0);

        // Determinar estado según nueva cantidad
        const nuevoEstado = nuevaCantidad > 0 ? 1 : 0;

        const [result] = await db.query(
            `UPDATE insumos SET 
                id_categoria = ?,
                nombre_insumo = ?,
                cantidad_disponible = ?,
                precio_unitario = ?,
                estado = ?
            WHERE id_insumo = ?`,
            [id_categoria, nombreNormalizado, nuevaCantidad, precio_unitario, nuevoEstado, id]
        );
        return result.affectedRows > 0;
    },

    // Desactivar automáticamente cuando stock = 0
    desactivarSiStockCero: async (id) => {
        const [rows] = await db.query(
            `SELECT cantidad_disponible FROM insumos WHERE id_insumo = ?`, [id]
        );
        if (rows[0]?.cantidad_disponible === 0) {
            await db.query(
                `UPDATE insumos SET estado = 0 WHERE id_insumo = ?`, [id]
            );
        }
    },

    // Softdelete — desactivar manualmente
    softDelete: async (id) => {
        const [result] = await db.query(
            `UPDATE insumos SET estado = 0 WHERE id_insumo = ?`, [id]
        );
        return result.affectedRows > 0;
    },

    // Reactivar
    reactivar: async (id) => {
        const [result] = await db.query(
            `UPDATE insumos SET estado = 1 WHERE id_insumo = ?`, [id]
        );
        return result.affectedRows > 0;
    }
};

export default product;