import db from '../../config/db.js';

const prodtsUsedServ = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT 
                ius.id_insumos_orden,
                ius.id_orden,
                ius.id_insumo,
                ius.cantidad,
                i.nombre_insumo
            FROM insumos_usados_en_servicio ius
            INNER JOIN insumos i ON ius.id_insumo = i.id_insumo
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(`
            SELECT 
                ius.id_insumos_orden,
                ius.id_orden,
                ius.id_insumo,
                ius.cantidad,
                i.nombre_insumo
            FROM insumos_usados_en_servicio ius
            INNER JOIN insumos i ON ius.id_insumo = i.id_insumo
            WHERE ius.id_insumos_orden = ?
        `, [id]);
        return rows[0];
    },

    create: async (data) => {
        const { id_orden, id_insumo, cantidad } = data;
        const [result] = await db.query(
            `INSERT INTO insumos_usados_en_servicio (id_orden, id_insumo, cantidad) VALUES (?, ?, ?)`,
            [id_orden, id_insumo, cantidad]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { id_orden, id_insumo, cantidad } = data;
        const [result] = await db.query(
            `UPDATE insumos_usados_en_servicio SET id_orden = ?, id_insumo = ?, cantidad = ? WHERE id_insumos_orden = ?`,
            [id_orden, id_insumo, cantidad, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insumos_usados_en_servicio WHERE id_insumos_orden = ?`, 
            [id]
        );
        return result.affectedRows > 0;
    }
}; 

export default prodtsUsedServ;