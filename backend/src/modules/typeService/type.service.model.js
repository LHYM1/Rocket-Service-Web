// 1. Cambiamos require por import y agregamos el .js
import db from '../../config/db.js';

const typeService = {
    findAll: async () => { // Listar
        const [rows] = await db.query('SELECT * FROM tipo_servicio');
        return rows;
    },

    // consultar por id
    findById : async (id) => {
        const [rows] = await db.query(`SELECT * FROM tipo_servicio
        WHERE id_tipo_servicio = ?`, [id]);
        return rows[0];
    },

    // crear
    create: async (data) => {
        const {
            nombre_servicio,
            descripcion_servicio,
        } = data;

        const [result] = await db.query(
            `INSERT INTO tipo_servicio (nombre_servicio,
            descripcion_servicio) VALUES (?, ?)`,

            [nombre_servicio, descripcion_servicio]
        );
        return result.insertId;
    },

    // actualizar
    update : async (id, data) => {
        const {
            nombre_servicio,
            descripcion_servicio
        } = data;

        const [result] = await db.query (
            `UPDATE tipo_servicio SET
            nombre_servicio = ?, descripcion_servicio = ?
            WHERE id_tipo_servicio = ?`,

            [
                nombre_servicio,
                descripcion_servicio,
                id
            ]
        );
        return result.affectedRows > 0;
    },

    // eliminar
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM tipo_servicio WHERE id_tipo_servicio = ?`, [id]
        );
        return result.affectedRows > 0;
    }

}; 

// Cambiamos module.exports por export default
export default typeService;