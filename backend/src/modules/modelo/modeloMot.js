import db from '../../config/db.js';

const modeloModel = {
    findAll: async () => {
        const query = `
            SELECT 
                mo.id_modelo, 
                mo.nombre,
                COUNT(m.id_moto) AS total_motos
            FROM modelo mo
            LEFT JOIN motocicleta m ON mo.id_modelo = m.id_modelo
            GROUP BY mo.id_modelo, mo.nombre
            ORDER BY mo.nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM modelo WHERE id_modelo = ?', [id]);
        return rows[0];
    },

    findByNombre: async (nombre) => {
        const [rows] = await db.query('SELECT * FROM modelo WHERE UPPER(nombre) = UPPER(?)', [nombre]);
        return rows[0] || null;
    },

    findByNombreExcluyendoId: async (nombre, id) => {
        const [rows] = await db.query(
            'SELECT * FROM modelo WHERE UPPER(nombre) = UPPER(?) AND id_modelo != ?',
            [nombre, id]
        );
        return rows[0] || null;
    },


    update: async (id, nombre) => {
        const [result] = await db.query('UPDATE modelo SET nombre = ? WHERE id_modelo = ?', [nombre.trim(), id]);
        return result.affectedRows > 0;
    },

    create: async (nombre) => {
        const [result] = await db.query('INSERT INTO modelo (nombre) VALUES (?)', [nombre.trim()]);
        return result.insertId;
    },

    // Retorna la cantidad de motos asociadas a este modelo
    countMotosAsociadas: async (id_modelo) => {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS total FROM motocicleta WHERE id_modelo = ?', 
            [id_modelo]
        );
        return rows[0].total;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM modelo WHERE id_modelo = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default modeloModel;