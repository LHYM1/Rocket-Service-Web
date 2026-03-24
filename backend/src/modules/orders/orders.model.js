const db = require('../../config/db');

const ordenes = {
    findAll: async () => { // Este método sirve para traer toda la tabla de ordenes
        const [rows] = await db.query(`
            SELECT 
                o.id_orden,
                0.codigo_orden,
                m.id_moto ,
                u.id_usuario ,
                u.id_tecnico_asignado,
                tip.id_tipo_servicio,
                s.id_estado_de_servicio,
                o.fecha_de_creacion,
                o.fecha_finalizacion_estimada,
                o.descripcion_del_problema
                t.categoria_usuario AS clasificacion_de_usuarios
            FROM usuarios u 
            INNER JOIN clasificacion_de_usuarios t
            ON u.id_tipo_usuario = t.id_tipo_usuario
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM ordenes_de_servicio WHERE id_orden  = ?', [id]);
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
            fecha_de_creacion,
            fecha_finalizacion_estimada,
            descripcion_del_problema,
            
        } = data;

        const [result] = await db.query('INSERT INTO usuarios (nombre, apellido, correo_usuario, telefono_usuario, contrasena) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, correo_usuario, telefono_usuario, null, 1]);
        return result.insertId;
    },

    update: async (id, data) => {
        const { 
            nombre, 
            apellido, 
            correo_usuario, 
            telefono_usuario, 
        } = data;

        const [result] = await db.query('UPDATE usuarios SET nombre = ?, apellido = ?, correo_usuario = ?, telefono_usuario = ? WHERE id_usuario = ?',
            [nombre, apellido, correo_usuario, telefono_usuario, id]);
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = ordenes;
