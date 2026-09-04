import pool from '../../config/db.js';

// Buscar token de técnico activo (máximo 10 minutos desde fecha_creacion)
export const findTecnicoTokenByEmail = async (correo_usuario) => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, t.id_token, t.token,
            TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW()) AS minutos_transcurridos
     FROM usuarios u
     INNER JOIN tokens_autenticacion t ON u.id_usuario = t.id_usuario
     WHERE u.correo_usuario = ? 
       AND u.estado = 1 
       AND t.tipo_token = 'REGISTRO'`,
    [correo_usuario]
  );
  return rows[0];
};

// Activar usuario (Técnico o Cliente)
export const updateUsuarioActivo = async ({ id_usuario, hashedPassword, nombre, apellido, telefono_usuario }) => {
  if (nombre && apellido && telefono_usuario) {
    // Caso Técnico: Actualiza contraseña y datos personales
    await pool.query(
      `UPDATE usuarios 
       SET contrasena = ?, nombre = ?, apellido = ?, telefono_usuario = ?, estado = 2
       WHERE id_usuario = ?`,
      [hashedPassword, nombre, apellido, telefono_usuario, id_usuario]
    );
  } else {
    // Caso Cliente: Actualiza solo la contraseña
    await pool.query(
      `UPDATE usuarios 
       SET contrasena = ?, estado = 2 
       WHERE id_usuario = ?`,
      [hashedPassword, id_usuario]
    );
  }
};

// Eliminar el token una vez consumido
export const deleteTokenById = async (id_token) => {
  await pool.query(`DELETE FROM tokens_autenticacion WHERE id_token = ?`, [id_token]);
};

// Verificar si existe correo activo (estado = 2)
export const findUsuarioActivoByEmail = async (correo_usuario) => {
  const [rows] = await pool.query(
    `SELECT id_usuario FROM usuarios WHERE correo_usuario = ? AND estado = 2`,
    [correo_usuario]
  );
  return rows.length > 0;
};

// Obtener datos para el Login
export const findUsuarioLoginByEmail = async (correo_usuario) => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.contrasena, 
            c.categoria_usuario AS role
     FROM usuarios u
     INNER JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario 
     WHERE u.correo_usuario = ?`,
    [correo_usuario]
  );
  return rows[0];
};

// Buscar token de cliente por cadena (máximo 24 horas desde fecha_creacion)
export const findClienteTokenByString = async (token) => {
  const [rows] = await pool.query(
    `SELECT t.id_token, t.id_usuario,
            TIMESTAMPDIFF(HOUR, t.fecha_creacion, NOW()) AS horas_transcurridas
     FROM tokens_autenticacion t
     INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
     WHERE t.token = ? 
       AND t.tipo_token = 'REGISTRO' 
       AND u.estado = 1`,
    [token]
  );
  return rows[0];
};