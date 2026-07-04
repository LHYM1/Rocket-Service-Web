import db from '../../config/db.js';

const motocicletas = {

    findByUsuario: async (idUsuario) => {
    const [rows] = await db.query(`
        SELECT m.id_moto, m.placa, mo.nombre AS nombre_modelo
        FROM motocicleta m
        LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
        WHERE m.id_usuario = ?
    `, [idUsuario]);
    return rows[0];
    },

    findAll: async () => {
    const [rows] = await db.query(`
        SELECT m.id_moto, m.placa, m.kilometraje_actual,
               m.id_modelo, m.id_usuario,
               u.nombre AS nombre_usuario,
               u.apellido AS apellido_usuario,
               mo.nombre AS nombre_modelo
        FROM motocicleta m
        LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
        LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
    `);
    return rows;
},

    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT * FROM motocicleta WHERE id_moto = ?', [id]
        );
        return rows[0];
    },

    create: async (data) => {
        const { placa, id_modelo, kilometraje_actual, id_usuario } = data;
        const [result] = await db.query(
            `INSERT INTO motocicleta (placa, id_modelo, kilometraje_actual, id_usuario)
             VALUES (?, ?, ?, ?)`,
            [placa, id_modelo, kilometraje_actual, id_usuario]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { placa, id_modelo, kilometraje_actual, id_usuario } = data;
        const [result] = await db.query(
            `UPDATE motocicleta
             SET placa = ?, id_modelo = ?, kilometraje_actual = ?, id_usuario = ?
             WHERE id_moto = ?`,
            [placa, id_modelo, kilometraje_actual, id_usuario, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query(
            'DELETE FROM motocicleta WHERE id_moto = ?', [id]
        );
        return result.affectedRows > 0;
    }
};

export default motocicletas;