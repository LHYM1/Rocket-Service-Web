import db from '../../config/db.js';

const insumo = {

    findAll: async () => {
    const [rows] = await db.query(`
        SELECT i.id_insumo, i.nombre_insumo, i.id_unidad, u.nombre AS nombre_unidad
        FROM insumos i
        LEFT JOIN unidad_de_medida u ON i.id_unidad = u.id_unidad
    `);
    return rows;
},

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM insumos WHERE id_insumo = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { nombre_insumo, id_categoria, id_unidad } = data;
        const [result] = await db.query(
            `INSERT INTO insumos (nombre_insumo, id_categoria, id_unidad) VALUES (?, ?, ?)`,
            [nombre_insumo, id_categoria, id_unidad]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nombre_insumo, id_categoria, id_unidad } = data;
        const [result] = await db.query(
            `UPDATE insumos SET nombre_insumo = ?, id_categoria = ?, id_unidad = ? WHERE id_insumo = ?`,
            [nombre_insumo, id_categoria, id_unidad, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM insumos WHERE id_insumo = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default insumo;