import db from '../../config/db.js';

const product = {
    findAll: async () => { // Listar
        const [rows] = await db.query(
            `SELECT 
                p.id_insumo,
                p.codigo_insumo,
                ct.nombre AS categoria,
                und.nombre AS unidad_de_medida,
                p.nombre_insumo,
                p.precio_base
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
            codigo_insumo,
            nombre_insumo,
            precio_base
        } = data;

        const [result] = await db.query(
            `INSERT INTO insumos (codigo_insumo, nombre_insumo,
            precio_base) VALUES (?, ?, ?)`,

            [codigo_insumo, nombre_insumo, precio_base]
        );
        return result.insertId;
    },

    // actualizar
    update : async (id, data) => {
        const {
            codigo_insumo,
            id_categoria, 
            id_unidad,
            nombre_insumo,
            precio_base
        } = data;

        const [result] = await db.query (
            `UPDATE insumos SET codigo_insumo = ?,
            id_categoria = ?, id_unidad = ?,
            nombre_insumo = ?, precio_base 
            WHERE id_insumo = ?`,

            [
                codigo_insumo,
                id_categoria,
                id_unidad,
                nombre_insumo,
                precio_base,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    // eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insumos WHERE id_insumo  = ?`, [id]
        );
        return result.affectedRows > 0;
    }

}; 

export default product;