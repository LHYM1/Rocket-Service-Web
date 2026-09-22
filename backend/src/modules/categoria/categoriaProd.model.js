import db from '../../config/db.js';

const categoria = {

    // Ahora incluye cuántos insumos pertenecen a cada categoría (LEFT JOIN + COUNT,
    // para que las categorías sin insumos todavía aparezcan con 0, no se pierdan)
    findAll: async () => {
        const query = `
            SELECT 
                c.*,
                COUNT(i.id_insumo) AS total_insumos
            FROM categoria c
            LEFT JOIN insumos i ON i.id_categoria = c.id_categoria
            GROUP BY c.id_categoria
            ORDER BY c.nombre ASC
        `;
        const [rows] = await db.query(query);
        // PostgreSQL devuelve COUNT(...) como texto -- se convierte a número real
        return rows.map(r => ({ ...r, total_insumos: Number(r.total_insumos) }));
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM categoria WHERE id_categoria = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            nombre, 
            descripcion
        } = data;

        const [result] = await db.query(
            `INSERT INTO categoria
            
            (nombre, descripcion)

            VALUES (?, ?)`,
            [
                nombre, descripcion
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre, 
            descripcion
        } = data;

        const [result] = await db.query(
            `UPDATE categoria
             SET nombre = ?, descripcion = ?

             WHERE id_categoria = ?`,
            [
                nombre, 
                descripcion,
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM categoria WHERE id_categoria = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default categoria;