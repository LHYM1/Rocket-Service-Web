import db from '../../config/db.js';

const users = {
    findAll: async () => {
        const query = `
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
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findClientes: async () => {
        const query = `
            SELECT id_usuario, nombre, apellido 
            FROM usuarios 
            WHERE id_tipo_usuario = 1 AND estado = 1
            ORDER BY nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findClientesSinMoto: async () => {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido 
            FROM usuarios u
            LEFT JOIN motocicleta m ON u.id_usuario = m.id_usuario
            WHERE u.id_tipo_usuario = 1 AND u.estado = 1 AND m.id_moto IS NULL
            ORDER BY u.nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE id_usuario = ?', 
            [id]
        );
        return rows[0];
    },

    findByEmail: async (correo_usuario) => {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE correo_usuario = ?',
            [correo_usuario]
        );
        return rows[0] || null;
    },

    // Creación sin valores nulos (se usan strings vacíos)
    create: async (data) => {
        const { 
            nombre = '', 
            apellido = '', 
            correo_usuario, 
            telefono_usuario = '',
            contrasena = '',
            id_tipo_usuario,
            estado = 1
        } = data;

        const [result] = await db.query(
            `INSERT INTO usuarios 
            (nombre, apellido, correo_usuario, telefono_usuario, contrasena, id_tipo_usuario, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, 
                apellido, 
                correo_usuario, 
                telefono_usuario, 
                contrasena, 
                id_tipo_usuario, 
                estado
            ]
        );

        return { insertId: result.insertId };
    },

    // Inserción en la tabla independiente 'tokens_autenticacion'
    createToken: async ({ id_usuario, token, tipo_token = 'REGISTRO', fecha_expiracion }) => {
        await db.query(
            `INSERT INTO tokens_autenticacion (id_usuario, token, tipo_token, fecha_expiracion) 
             VALUES (?, ?, ?, ?)`,
            [id_usuario, token, tipo_token, fecha_expiracion]
        );
    },

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

        if (contrasena) {
            query += `, contrasena = ?`;
            params.push(contrasena);
        }

        query += ` WHERE id_usuario = ?`;
        params.push(id);

        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    },

    restaurar: async (id) => {
        const [result] = await db.query(
            'UPDATE usuarios SET estado = 1 WHERE id_usuario = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    remove: async (id) => {
        const [result] = await db.query(
            'UPDATE usuarios SET estado = 0 WHERE id_usuario = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default users;