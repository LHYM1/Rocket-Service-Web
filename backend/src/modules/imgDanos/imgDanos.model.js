// 1. Cambiamos require por import y agregamos el .js
import db from '../../config/db.js';

const ImagDanos = {
    findAll: async () => { // Listar
        const [rows] = await db.query('SELECT * FROM imagenes_danos');
        return rows;
    },

    // consultar por id
    findById : async (id) => {
        const [rows] = await db.query(`SELECT * FROM imagenes_danos
        WHERE id_imagen  = ?`, [id]);
        return rows[0];
    },

    // crear
    create: async (data) => {
        const {
            id_orden,
            descripcion,
            url_imagen
        } = data;

        const [result] = await db.query(
            `INSERT INTO imagenes_danos (id_orden, descripcion,
            url_imagen) VALUES (?, ?, ?)`,

            [id_orden, descripcion, url_imagen]
        );
        return result.insertId;
    },

    // actualizar
    update : async (id, data) => {
        const {
            id_orden,
            descripcion,
            url_imagen
        } = data;

        const [result] = await db.query (
            `UPDATE imagenes_danos SET id_orden = ?,
            descripcion = ?, url_imagen = ? WHERE id_insumos_orden = ?`,

            [
                id_orden,
                descripcion,
                url_imagen,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    // eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM imagenes_danos WHERE id_imagen = ?`, [id]
        );
        return result.affectedRows > 0;
    }

}; 

export default ImagDanos;