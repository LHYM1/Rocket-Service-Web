import db from '../../config/db.js';

const OrdenServicio = {

    updateRevision: async (id, data) => {
    const { id_tipo_servicio, descripcion_del_problema, fecha_finalizacion_estimada } = data;
    const [result] = await db.query(
        `UPDATE ordenes_de_servicio 
         SET id_tipo_servicio = ?, descripcion_del_problema = ?, fecha_finalizacion_estimada = ?
         WHERE id_orden = ?`,
        [id_tipo_servicio, descripcion_del_problema, fecha_finalizacion_estimada, id]
    );
    return result.affectedRows > 0;
    },

    updateEstadoByTecnico: async (idTecnico, idEstado) => {
    const [result] = await db.query(
        `UPDATE ordenes_de_servicio 
         SET id_estado_de_servicio = ?
         WHERE id_tecnico_asignado = ?
         AND id_estado_de_servicio NOT IN (3, 4, 7)`,
        [idEstado, idTecnico]
    );
    return result.affectedRows > 0;
    },

    updateEstado: async (idOrden, idEstado) => {
    const [result] = await db.query(
        `UPDATE ordenes_de_servicio 
         SET id_estado_de_servicio = ?
         WHERE id_orden = ?`,
        [idEstado, idOrden]
    );
    return result.affectedRows > 0;
    },

    findByTecnico: async (idTecnico) => {
    const [rows] = await db.query(`
        SELECT 
            o.id_orden,
            o.codigo_orden,
            o.descripcion_del_problema,
            o.fecha_de_creacion,
            o.fecha_finalizacion_estimada,
            o.id_moto,
            o.id_usuario,
            o.id_tecnico_asignado,
            o.id_tipo_servicio,
            o.id_estado_de_servicio,
            m.placa AS placa_moto,
            CONCAT(uc.nombre, ' ', uc.apellido) AS nombre_cliente,
            CONCAT(ut.nombre, ' ', ut.apellido) AS nombre_tecnico,
            ts.nombre_servicio,
            es.nombre_estado,
            mo.nombre AS nombre_modelo
        FROM ordenes_de_servicio o
        LEFT JOIN motocicleta m ON o.id_moto = m.id_moto
        LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
        LEFT JOIN usuarios uc ON o.id_usuario = uc.id_usuario
        LEFT JOIN usuarios ut ON o.id_tecnico_asignado = ut.id_usuario
        LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
        LEFT JOIN estado_de_orden_de_servicio es ON o.id_estado_de_servicio = es.id_estado_de_servicio
        WHERE o.id_tecnico_asignado = ?
    `, [idTecnico]);
    return rows;
    },
    
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
    const [rows] = await db.query(`
        SELECT 
            o.id_orden,
            o.codigo_orden,
            o.descripcion_del_problema,
            o.fecha_de_creacion,
            o.fecha_finalizacion_estimada,
            o.id_moto,
            o.id_usuario,
            o.id_tecnico_asignado,
            o.id_tipo_servicio,
            o.id_estado_de_servicio,
            m.placa AS placa_moto,
            CONCAT(uc.nombre, ' ', uc.apellido) AS nombre_cliente,
            CONCAT(ut.nombre, ' ', ut.apellido) AS nombre_tecnico,
            ts.nombre_servicio,
            es.nombre_estado,
            mo.nombre AS nombre_modelo
        FROM ordenes_de_servicio o
        LEFT JOIN motocicleta m ON o.id_moto = m.id_moto
        LEFT JOIN usuarios uc ON o.id_usuario = uc.id_usuario
        LEFT JOIN usuarios ut ON o.id_tecnico_asignado = ut.id_usuario
        LEFT JOIN tipo_servicio ts ON o.id_tipo_servicio = ts.id_tipo_servicio
        LEFT JOIN estado_de_orden_de_servicio es ON o.id_estado_de_servicio = es.id_estado_de_servicio
        LEFT JOIN modelo mo ON m.id_modelo = mo.id_modelo
    `);
    return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { 
            codigo_orden, 
            id_moto,
            id_usuario,
            id_tecnico_asignado,
            id_tipo_servicio,
            id_estado_de_servicio,
            fecha_finalizacion_estimada,
            descripcion_del_problema

        } = data;

        const [result] = await db.query(
            `INSERT INTO ordenes_de_servicio
            
            (codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio,
            fecha_finalizacion_estimada, descripcion_del_problema)

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                codigo_orden, id_moto, id_usuario, id_tecnico_asignado,
                id_tipo_servicio, id_estado_de_servicio, fecha_finalizacion_estimada,
                descripcion_del_problema
            ]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            codigo_orden, 
            id_moto,
            id_usuario,
            id_tecnico_asignado,
            id_tipo_servicio,
            id_estado_de_servicio,
            fecha_finalizacion_estimada,
            descripcion_del_problema 
        } = data;

        const [result] = await db.query(
            `UPDATE ordenes_de_servicio 
             SET codigo_orden = ?, id_moto = ?, 
             id_usuario = ?, id_tecnico_asignado = ?,
             id_tipo_servicio = ?, id_estado_de_servicio = ?,
             fecha_finalizacion_estimada = ?, descripcion_del_problema = ?

             WHERE id_orden = ?`,
            [
                codigo_orden, 
                id_moto,
                id_usuario,
                id_tecnico_asignado,
                id_tipo_servicio,
                id_estado_de_servicio,
                fecha_finalizacion_estimada,
                descripcion_del_problema,  
            id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM ordenes_de_servicio WHERE id_orden = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default OrdenServicio;