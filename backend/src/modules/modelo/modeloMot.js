import db from '../../config/db.js';

const modeloMot = {

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM modelo ORDER BY nombre ASC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM modelo WHERE id_modelo = ?', [id]);
        return rows[0];
    },

    // RN-002: nombre único
    findByNombre: async (nombre, excludeId = null) => {
        let query = 'SELECT * FROM modelo WHERE UPPER(nombre) = UPPER(?)';
        const params = [nombre];
        if (excludeId) {
            query += ' AND id_modelo != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(query, params);
        return rows[0];
    },

    create: async (data) => {
        const { nombre } = data;
        // RN-004 (registrar): estado predeterminado en Activo
        const [result] = await db.query(
            `INSERT INTO modelo (nombre, estado) VALUES (?, 1)`,
            [nombre.trim()]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nombre } = data;
        const [result] = await db.query(
            `UPDATE modelo SET nombre = ? WHERE id_modelo = ?`,
            [nombre.trim(), id]
        );
        return result.affectedRows > 0;
    },

    // RN-004: cuenta motocicletas asociadas a este modelo (para bloquear desactivación)
    contarMotosAsociadas: async (id) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM motocicleta WHERE id_modelo = ?', [id]
        );
        return rows[0].total;
    },

    // RN-003: softdelete, nunca eliminación física
    softDelete: async (id) => {
        const [result] = await db.query(
            'UPDATE modelo SET estado = 0 WHERE id_modelo = ?', [id]
        );
        return result.affectedRows > 0;
    },

    reactivar: async (id) => {
        const [result] = await db.query(
            'UPDATE modelo SET estado = 1 WHERE id_modelo = ?', [id]
        );
        return result.affectedRows > 0;
    }
};

export default modeloMot;