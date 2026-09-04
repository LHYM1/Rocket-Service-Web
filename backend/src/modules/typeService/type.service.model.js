import db from '../../config/db.js';

const typeService = {
    findAll: async () => {
        // Ordenado de MENOR a MAYOR por ID
        const [rows] = await db.query('SELECT * FROM tipo_servicio ORDER BY id_tipo_servicio ASC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT * FROM tipo_servicio WHERE id_tipo_servicio = ?',
            [id]
        );
        return rows[0];
    },

    findByNombre: async (nombre, idExcluir = null) => {
        let query = 'SELECT * FROM tipo_servicio WHERE nombre_servicio = ?';
        const params = [nombre];

        if (idExcluir) {
            query += ' AND id_tipo_servicio != ?';
            params.push(idExcluir);
        }

        const [rows] = await db.query(query, params);
        return rows[0];
    },

    create: async (data) => {
        const { nombre_servicio, descripcion_servicio } = data;
        const [result] = await db.query(
            `INSERT INTO tipo_servicio (nombre_servicio, descripcion_servicio, estado) VALUES (?, ?, 1)`,
            [nombre_servicio, descripcion_servicio ? descripcion_servicio.trim() : null]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nombre_servicio, descripcion_servicio } = data;
        const [result] = await db.query(
            `UPDATE tipo_servicio 
             SET nombre_servicio = ?, descripcion_servicio = ? 
             WHERE id_tipo_servicio = ?`,
            [nombre_servicio, descripcion_servicio ? descripcion_servicio.trim() : null, id]
        );
        return result.affectedRows > 0;
    },

    changeStatus: async (id, estado) => {
        const [result] = await db.query(
            'UPDATE tipo_servicio SET estado = ? WHERE id_tipo_servicio = ?',
            [estado, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query(
            'DELETE FROM tipo_servicio WHERE id_tipo_servicio = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default typeService;