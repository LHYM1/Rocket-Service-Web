import db from '../../config/db.js';

const unidadMedida = {

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM unidad_de_medida ORDER BY nombre ASC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM unidad_de_medida WHERE id_unidad = ?', [id]);
        return rows[0];
    },

    findByNombre: async (nombre, excludeId = null) => {
        let query = 'SELECT * FROM unidad_de_medida WHERE UPPER(nombre) = UPPER(?)';
        const params = [nombre];
        if (excludeId) {
            query += ' AND id_unidad != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(query, params);
        return rows[0];
    },

    create: async (data) => {
        const { nombre, simbolo } = data;
        const [result] = await db.query(
            `INSERT INTO unidad_de_medida (nombre, simbolo) VALUES (?, ?)`,
            [nombre.trim(), simbolo ? simbolo.trim().toUpperCase() : null]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nombre, simbolo } = data;
        const [result] = await db.query(
            `UPDATE unidad_de_medida SET nombre = ?, simbolo = ? WHERE id_unidad = ?`,
            [nombre.trim(), simbolo ? simbolo.trim().toUpperCase() : null, id]
        );
        return result.affectedRows > 0;
    },

    // Cuenta cuántos insumos usan esta unidad de medida (para bloquear eliminación)
    contarInsumosAsociados: async (id) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM insumos WHERE id_unidad = ?', [id]
        );
        return rows[0].total;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM unidad_de_medida WHERE id_unidad = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default unidadMedida;