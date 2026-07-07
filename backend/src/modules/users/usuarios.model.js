import db from '../../config/db.js';

const users = {

    findClientesConMoto: async () => {
    const [rows] = await db.query(`
        SELECT DISTINCT u.id_usuario, u.nombre, u.apellido
        FROM usuarios u
        INNER JOIN motocicleta m ON u.id_usuario = m.id_usuario
        WHERE u.id_tipo_usuario = 1
          AND u.estado = 1
    `);
    return rows;
    },

    findTecnicosSinOrden: async () => {
    const [rows] = await db.query(`
        SELECT u.id_usuario, u.nombre, u.apellido
        FROM usuarios u
        WHERE u.id_tipo_usuario = 2
          AND u.estado = 1
          AND u.id_usuario NOT IN (
              SELECT id_tecnico_asignado 
              FROM ordenes_de_servicio 
              WHERE id_estado_de_servicio NOT IN (3, 4, 7)
              AND id_tecnico_asignado IS NOT NULL
          )
    `);
    return rows;
    },

    // Traer TODOS (activos e inactivos)
    findAll: async () => {
        const query = (`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo_usuario,
                u.telefono_usuario,
                u.estado,

                cat.id_tipo_usuario,
                cat.categoria_usuario

            FROM usuarios u 
            LEFT JOIN clasificacion_de_usuarios cat 
                ON u.id_tipo_usuario = cat.id_tipo_usuario
        `);

        const [rows] = await db.query(query);
        return rows;
    },

        // Solo usuarios (id_tipo_usuario=1) que NO tienen moto registrada, esto trae usuarios que no tienen una moto registrada en el sistema.
            findUsuariosSinMoto: async () => {
            const [rows] = await db.query(`
            SELECT u.id_usuario, u.nombre, u.apellido
            FROM usuarios u
            WHERE u.id_tipo_usuario = 1
            AND u.estado = 1
            AND u.id_usuario NOT IN (
                SELECT id_usuario FROM motocicleta WHERE id_usuario IS NOT NULL
            )
        `);
        return rows;
},

    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE id_usuario = ?', 
            [id]
        );
        return rows[0];
    },

    // Crear nuevo usuario
    create: async (data) => {
        const { 
            nombre, 
            apellido, 
            correo_usuario, 
            telefono_usuario,
            contrasena,
            id_tipo_usuario
        } = data;

        const [result] = await db.query(
            `INSERT INTO usuarios 
            (nombre, apellido, correo_usuario, telefono_usuario, contrasena, id_tipo_usuario, estado) 
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [nombre, apellido, correo_usuario, telefono_usuario, contrasena, id_tipo_usuario]
        );

        return result.insertId;
    },

    // Actualizar 
    update: async (id, data) => {
        const { 
            nombre, 
            apellido, 
            correo_usuario, 
            telefono_usuario,
            contrasena,
            id_tipo_usuario
        } = data;

        let query = `
            UPDATE usuarios SET 
                nombre = ?, 
                apellido = ?, 
                correo_usuario = ?, 
                telefono_usuario = ?, 
                id_tipo_usuario = ?
        `;

        let params = [nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario];

        // Solo actualiza contraseña si viene
        if (contrasena) {
            query += `, contrasena = ?`;
            params.push(contrasena);
        }

        query += ` WHERE id_usuario = ?`;
        params.push(id);

        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    },

    // Activar usuario inactivo
    restaurar: async (id) => {
        const [result] = await db.query(
            'UPDATE usuarios SET estado = 1 WHERE id_usuario = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    findByEmail: async (correo) => {
    const [rows] = await db.query(
        'SELECT * FROM usuarios WHERE correo_usuario = ?',
        [correo]
    );
    return rows[0];
    },

    // Desactivar softDelete 
    remove: async (id) => {
        const [result] = await db.query(
            'UPDATE usuarios SET estado = 0 WHERE id_usuario = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    
};

export default users;