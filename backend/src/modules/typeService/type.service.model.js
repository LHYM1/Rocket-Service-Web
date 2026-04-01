const db = require ('../../config/db');

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
            codigo_tipo_servicio,
            nombre_servicio,
            descripcion_servicio,
            costo_servicio
        } = data;

        const [result] = await db.query(
            `INSERT INTO tipo_servicio (codigo_tipo_servicio, nombre_servicio,
            descripcion_servicio, costo_servicio) VALUES (?, ?, ?, ?)`,

            [codigo_tipo_servicio, nombre_servicio, descripcion_servicio, costo_servicio]
        );
        return result.insertId;
    },

    // actualizar
    update : async (id, data) => {
        const {
            codigo_tipo_servicio,
            nombre_servicio,
            descripcion_servicio,
            costo_servicio
        } = data;

        const [result] = await db.query (
            `UPDATE tipo_servicio SET codigo_tipo_servicio = ?,
            nombre_servicio = ?, descripcion_servicio = ?,
            costo_servicio = ? WHERE id_tipo_servicio = ?`,

            [
                codigo_tipo_servicio,
                nombre_servicio,
                descripcion_servicio,
                costo_servicio,
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

module.exports = typeService;