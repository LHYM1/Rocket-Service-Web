import db from '../../config/db.js';

const categoria = {
    findAll: async () => {
        const query = `
            SELECT 
                c.id_categoria,
                c.nombre,
                c.Descripcion,
                c.estado,
                COUNT(i.id_insumo) AS total_insumos
            FROM categoria c
            LEFT JOIN insumos i ON c.id_categoria = i.id_categoria
            GROUP BY c.id_categoria, c.nombre, c.Descripcion, c.estado
            ORDER BY c.nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM categoria WHERE id_categoria = ?', [id]);
        return rows[0] || null;
    },

    findByNombre: async (nombre) => {
        const [rows] = await db.query('SELECT * FROM categoria WHERE UPPER(nombre) = UPPER(?)', [nombre]);
        return rows[0] || null;
    },

    // Usado por actualizarCatInsumo para validar duplicidad excluyendo el propio registro
    findByNombreExcluyendoId: async (nombre, id) => {
        const [rows] = await db.query(
            'SELECT * FROM categoria WHERE UPPER(nombre) = UPPER(?) AND id_categoria != ?',
            [nombre, id]
        );
        return rows[0] || null;
    },

    create: async (data) => {
        const { nombre, Descripcion, estado = 1 } = data;
        const [result] = await db.query(
            `INSERT INTO categoria (nombre, Descripcion, estado) VALUES (?, ?, ?)`,
            [nombre.trim(), Descripcion ? Descripcion.trim() : null, estado]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nombre, Descripcion } = data;
        const [result] = await db.query(
            `UPDATE categoria SET nombre = ?, Descripcion = ? WHERE id_categoria = ?`,
            [nombre.trim(), Descripcion ? Descripcion.trim() : null, id]
        );
        return result.affectedRows > 0;
    },

    // Cantidad de insumos que usan esta categoría (ajustar nombre de columna/tabla si difiere)
    countInsumosAsociados: async (id_categoria) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM insumos WHERE id_categoria = ?',
            [id_categoria]
        );
        return rows[0].total;
    },

    // Reemplaza el borrado físico: activa (1) o desactiva (0) la categoría
    cambiarEstado: async (id, estado) => {
        const [result] = await db.query(
            'UPDATE categoria SET estado = ? WHERE id_categoria = ?',
            [estado, id]
        );
        return result.affectedRows > 0;
    }
};

export default categoria;