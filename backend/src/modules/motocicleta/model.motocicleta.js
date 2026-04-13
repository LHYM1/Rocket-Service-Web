import db from '../../config/db.js';

const motocicletas = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = ('SELECT * FROM motocicleta');
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM motocicleta WHERE id_moto = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            placa, 
            id_modelo,
            kilometraje_actual

        } = data;

        const [result] = await db.query(
            `INSERT INTO motocicleta
            
            (placa, id_modelo, kilometraje_actual)

            VALUES (?, ?, ?)`,
            [
                placa, id_modelo, 
                kilometraje_actual
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            placa, 
            id_modelo,
            kilometraje_actual,
        } = data;

        const [result] = await db.query(
            `UPDATE motocicleta
             SET placa = ?, id_modelo = ?, 
             kilometraje_actual = ?

             WHERE id_moto = ?`,
            [
                placa, 
                id_modelo,
                kilometraje_actual,
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM motocicleta WHERE id_moto  = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default motocicletas;