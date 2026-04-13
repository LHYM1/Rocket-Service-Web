// 1. Cambiamos require por import y agregamos el .js
import db from '../../config/db.js';

const prodtsUsedServ = {
    findAll: async () => { // Listar
        const [rows] = await db.query('SELECT * FROM insumos_usados_en_servicio');
        return rows;
    },

    // consultar por id
    findById : async (id) => {
        const [rows] = await db.query(`SELECT * FROM insumos_usados_en_servicio
        WHERE id_insumos_orden  = ?`, [id]);
        return rows[0];
    },

    // crear
    create: async (data) => {
        const {
            id_orden,
            id_insumo ,
            cantidad
        } = data;

        const [result] = await db.query(
            `INSERT INTO insumos_usados_en_servicio (id_orden, id_insumo,
            cantidad) VALUES (?, ?, ?)`,

            [id_orden, id_insumo, cantidad]
        );
        return result.insertId;
    },

    // actualizar
    update : async (id, data) => {
        const {
            id_orden,
            id_insumo,
            cantidad,
        } = data;

        const [result] = await db.query (
            `UPDATE insumos_usados_en_servicio SET id_orden = ?,
            id_insumo = ?, cantidad = ? WHERE id_insumos_orden = ?`,

            [
                id_orden,
                id_insumo,
                cantidad,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    // eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insumos_usados_en_servicio WHERE id_insumos_orden = ?`, [id]
        );
        return result.affectedRows > 0;
    }

}; 


export default prodtsUsedServ;