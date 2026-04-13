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
            
                p.nombre_insumo

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

    // crear
    create: async (data) => {
        const {
            id_categoria,
            id_unidad,
            nombre_insumo
        } = data;

        const [result] = await db.query(
            `INSERT INTO insumos (id_categoria, id_unidad,
            nombre_insumo) VALUES (?, ?, ?)`,

            [id_categoria, id_unidad, nombre_insumo]
        );
        return result.insertId;
    },

    // actualizar
    update : async (id, data) => {
        const {
            id_categoria, 
            id_unidad,
            nombre_insumo,
        } = data;

        const [result] = await db.query (
            `UPDATE insumos SET id_categoria = ?,
            id_unidad = ?, nombre_insumo = ? WHERE id_insumo = ?`,

            [
                id_categoria,
                id_unidad,
                nombre_insumo,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    // eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insumos WHERE id_insumo = ?`, [id]
        );
        return result.affectedRows > 0;
    }

}; 

export default product;