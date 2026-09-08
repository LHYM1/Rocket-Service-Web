import db from '../../config/db.js';

const motocicletas = {
    findAll: async () => {
        const query = `
            SELECT 
                m.id_moto,
                m.placa,
                m.kilometraje_actual,
                m.id_modelo,
                m.id_usuario,
                m.estado,
                u.nombre AS nombre_usuario,
                u.apellido AS apellido_usuario,
                mo.nombre AS nombre_modelo
            FROM motocicleta m
            LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
            LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
            ORDER BY m.id_moto DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const query = `
            SELECT 
                m.id_moto,
                m.placa,
                m.kilometraje_actual,
                m.id_modelo,
                m.id_usuario,
                m.estado,
                u.nombre AS nombre_usuario,
                u.apellido AS apellido_usuario,
                mo.nombre AS nombre_modelo
            FROM motocicleta m
            LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
            LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
            WHERE m.id_moto = ?
        `;
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    },

    findByPlaca: async (placa) => {
        const query = `
            SELECT 
                m.id_moto,
                m.placa,
                m.kilometraje_actual,
                m.id_modelo,
                m.id_usuario,
                m.estado,
                u.nombre AS nombre_usuario,
                u.apellido AS apellido_usuario,
                mo.nombre AS nombre_modelo
            FROM motocicleta m
            LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
            LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
            WHERE UPPER(m.placa) = UPPER(?)
        `;
        const [rows] = await db.query(query, [placa]);
        return rows[0] || null;
    },

    // Obtener usuarios con rol Cliente (id_tipo_usuario = 1) que no tienen motocicleta registrada activa
    findUsuariosSinMoto: async () => {
        const query = `
            SELECT 
                u.id_usuario, 
                u.nombre, 
                u.apellido 
            FROM usuarios u
            LEFT JOIN motocicleta m ON u.id_usuario = m.id_usuario AND m.estado = 1
            WHERE u.id_tipo_usuario = 1 
              AND u.estado = 2 
              AND m.id_moto IS NULL
            ORDER BY u.nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    create: async (data) => {
        const { placa, id_modelo, kilometraje_actual, id_usuario, estado = 1 } = data;
        const [result] = await db.query(
            `INSERT INTO motocicleta (placa, id_modelo, kilometraje_actual, id_usuario, estado) 
             VALUES (?, ?, ?, ?, ?)`,
            [placa.toUpperCase().trim(), id_modelo, kilometraje_actual || 0, id_usuario, estado]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { id_modelo, kilometraje_actual, id_usuario, estado } = data;
        const [result] = await db.query(
            `UPDATE motocicleta 
             SET id_modelo = COALESCE(?, id_modelo), 
                 kilometraje_actual = COALESCE(?, kilometraje_actual), 
                 id_usuario = COALESCE(?, id_usuario), 
                 estado = COALESCE(?, estado)
             WHERE id_moto = ?`,
            [id_modelo, kilometraje_actual, id_usuario, estado, id]
        );
        return result.affectedRows > 0;
    },

    // Borrado lógico
    desactivar: async (id) => {
        const [result] = await db.query('UPDATE motocicleta SET estado = 0 WHERE id_moto = ?', [id]);
        return result.affectedRows > 0;
    },

    reactivar: async (id, nuevoKilometraje) => {
        const [result] = await db.query(
            'UPDATE motocicleta SET estado = 1, kilometraje_actual = ? WHERE id_moto = ?', 
            [nuevoKilometraje, id]
        );
        return result.affectedRows > 0;
    }
};

export default motocicletas;