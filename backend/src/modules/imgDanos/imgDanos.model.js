import db from '../../config/db.js';

const ImagDanos = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT i.*, o.codigo_orden
            FROM imagenes_danos i
            LEFT JOIN ordenes_de_servicio o ON i.id_orden = o.id_orden
            ORDER BY i.id_imagen DESC
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(`SELECT * FROM imagenes_danos WHERE id_imagen = ?`, [id]);
        return rows[0];
    },

    // Todas las fotos de UNA orden puntual (para el Técnico y para "Evidencias" del Cliente)
    findByOrden: async (id_orden) => {
        const [rows] = await db.query(
            `SELECT * FROM imagenes_danos WHERE id_orden = ? ORDER BY id_imagen ASC`,
            [id_orden]
        );
        return rows;
    },

    create: async (data) => {
        const { id_orden, descripcion, url_imagen, tipo } = data;
        const [result] = await db.query(
            `INSERT INTO imagenes_danos (id_orden, descripcion, url_imagen, tipo) VALUES (?, ?, ?, ?)`,
            [id_orden, descripcion, url_imagen, tipo || 'Daño']
        );
        return result.insertId;
    },

    // actualizar -- corregido: antes filtraba por una columna que no existe en esta tabla
    update: async (id, data) => {
        const { id_orden, descripcion, url_imagen, tipo } = data;
        const [result] = await db.query(
            `UPDATE imagenes_danos SET id_orden = ?, descripcion = ?, url_imagen = ?, tipo = ? WHERE id_imagen = ?`,
            [id_orden, descripcion, url_imagen, tipo, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM imagenes_danos WHERE id_imagen = ?`, [id]
        );
        return result.affectedRows > 0;
    }

};

export default ImagDanos;