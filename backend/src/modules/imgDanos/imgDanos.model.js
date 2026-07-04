import db from '../../config/db.js';

const imgDanosModel = {

    findAll: async () => {
        const [rows] = await db.query(`
            SELECT id.id_imagen, id.id_orden, id.descripcion, id.url_imagen,
                   os.codigo_orden
            FROM imagenes_danos id
            JOIN ordenes_de_servicio os ON id.id_orden = os.id_orden
        `);
        return rows;
    },

    findByOrden: async (idOrden) => {
        const [rows] = await db.query(`
            SELECT id_imagen, id_orden, descripcion, url_imagen
            FROM imagenes_danos
            WHERE id_orden = ?
        `, [idOrden]);
        return rows;
    },

    // Órdenes del técnico que están en ESPERANDO REPUESTOS (id 16)
    findOrdenesTecnico: async (idTecnico) => {
        const [rows] = await db.query(`
            SELECT os.id_orden, os.codigo_orden, os.id_estado_de_servicio,
                   CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente,
                   m.placa AS placa_moto, mo.nombre AS nombre_modelo
            FROM ordenes_de_servicio os
            JOIN usuarios u ON os.id_usuario = u.id_usuario
            JOIN motocicleta m ON os.id_moto = m.id_moto
            JOIN modelo mo ON m.id_modelo = mo.id_modelo
            WHERE os.id_tecnico_asignado = ?
            AND os.id_estado_de_servicio = 16
        `, [idTecnico]);
        return rows;
    },

    create: async (data) => {
        const { id_orden, descripcion, url_imagen } = data;
        const [result] = await db.query(
            `INSERT INTO imagenes_danos (id_orden, descripcion, url_imagen) 
             VALUES (?, ?, ?)`,
            [id_orden, descripcion, url_imagen]
        );
        return result.insertId;
    },

    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM imagenes_danos WHERE id_imagen = ?`, [id]
        );
        return result.affectedRows > 0;
    },

    // Contar imágenes de una orden (para validar antes de Empezar servicio)
    countByOrden: async (idOrden) => {
        const [rows] = await db.query(
            `SELECT COUNT(*) as total FROM imagenes_danos WHERE id_orden = ?`,
            [idOrden]
        );
        return rows[0].total;
    }
};

export default imgDanosModel;