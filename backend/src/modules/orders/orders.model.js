import db from '../../config/db.js';

const OrdenServicio = {
    // Traer todas las órdenes con Nombres de Técnicos y Estados (JOIN)
    findAll: async () => {
        const query = ('SELECT * FROM ordenes_de_servicio');
        const [rows] = await db.query(query);
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