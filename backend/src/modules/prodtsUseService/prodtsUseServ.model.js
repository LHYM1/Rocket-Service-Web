import db from '../../config/db.js';

const prodtsUsedServ = {

    // Listar todos con nombre del insumo y unidad de medida
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT 
                ius.id_insumos_orden,
                ius.id_orden,
                ius.id_insumo,
                ius.cantidad,
                i.nombre_insumo,
                um.nombre AS nombre_unidad
            FROM insumos_usados_en_servicio ius
            JOIN insumos i ON ius.id_insumo = i.id_insumo
            JOIN unidad_de_medida um ON i.id_unidad = um.id_unidad
        `);
        return rows;
    },

    // Listar por orden con nombre del insumo y unidad de medida
    findByOrden: async (idOrden) => {
        const [rows] = await db.query(`
            SELECT 
                ius.id_insumos_orden,
                ius.id_orden,
                ius.id_insumo,
                ius.cantidad,
                i.nombre_insumo,
                um.nombre AS nombre_unidad
            FROM insumos_usados_en_servicio ius
            JOIN insumos i ON ius.id_insumo = i.id_insumo
            JOIN unidad_de_medida um ON i.id_unidad = um.id_unidad
            WHERE ius.id_orden = ?
        `, [idOrden]);
        return rows;
    },

    // Consultar por id
    findById: async (id) => {
        const [rows] = await db.query(`
            SELECT 
                ius.id_insumos_orden,
                ius.id_orden,
                ius.id_insumo,
                ius.cantidad,
                i.nombre_insumo,
                um.nombre AS nombre_unidad
            FROM insumos_usados_en_servicio ius
            JOIN insumos i ON ius.id_insumo = i.id_insumo
            JOIN unidad_de_medida um ON i.id_unidad = um.id_unidad
            WHERE ius.id_insumos_orden = ?
        `, [id]);
        return rows[0];
    },

    // Listar insumos solo de las órdenes del técnico logueado
    findByTecnico: async (idTecnico) => {
        const [rows] = await db.query(`
            SELECT 
                ius.id_insumos_orden,
                ius.id_orden,
                ius.id_insumo,
                ius.cantidad,
                i.nombre_insumo,
                um.nombre AS nombre_unidad
            FROM insumos_usados_en_servicio ius
            JOIN insumos i ON ius.id_insumo = i.id_insumo
            JOIN unidad_de_medida um ON i.id_unidad = um.id_unidad
            JOIN ordenes_de_servicio os ON ius.id_orden = os.id_orden
            WHERE os.id_tecnico_asignado = ?
        `, [idTecnico]);
        return rows;
    },

    // Crear
    create: async (data) => {
        const { id_orden, id_insumo, cantidad } = data;
        const [result] = await db.query(
            `INSERT INTO insumos_usados_en_servicio (id_orden, id_insumo, cantidad) 
             VALUES (?, ?, ?)`,
            [id_orden, id_insumo, cantidad]
        );
        return result.insertId;
    },

    // Actualizar
    update: async (id, data) => {
        const { id_orden, id_insumo, cantidad } = data;
        const [result] = await db.query(
            `UPDATE insumos_usados_en_servicio 
             SET id_orden = ?, id_insumo = ?, cantidad = ? 
             WHERE id_insumos_orden = ?`,
            [id_orden, id_insumo, cantidad, id]
        );
        return result.affectedRows > 0;
    },

    // Eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insumos_usados_en_servicio WHERE id_insumos_orden = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default prodtsUsedServ;