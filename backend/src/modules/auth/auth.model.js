import pool from '../../config/db.js';

export const findTecnicoTokenByEmail = async (correo_usuario) => {
  const correoLimpio = correo_usuario ? correo_usuario.trim().toLowerCase() : '';
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.correo_usuario, t.id_token, t.token, t.intentos,
            TIMESTAMPDIFF(MINUTE, t.fecha_creacion, NOW()) AS minutos_transcurridos
     FROM usuarios u
     INNER JOIN tokens_autenticacion t ON u.id_usuario = t.id_usuario
     WHERE LOWER(TRIM(u.correo_usuario)) = LOWER(?) 
       AND u.estado = 1 
       AND t.tipo_token = 'REGISTRO'
     ORDER BY t.fecha_creacion DESC
     LIMIT 1`,
    [correoLimpio]
  );
  return rows[0];
};

export const incrementarIntentosToken = async (id_token) => {
  await pool.query(
    `UPDATE tokens_autenticacion SET intentos = intentos + 1 WHERE id_token = ?`,
    [id_token]
  );
};

export const updateUsuarioActivo = async ({ id_usuario, hashedPassword, nombre, apellido, telefono_usuario }) => {
  if (nombre && apellido && telefono_usuario) {
    await pool.query(
      `UPDATE usuarios 
       SET contrasena = ?, nombre = ?, apellido = ?, telefono_usuario = ?, estado = 2
       WHERE id_usuario = ?`,
      [hashedPassword, nombre, apellido, telefono_usuario, id_usuario]
    );
  } else {
    await pool.query(
      `UPDATE usuarios 
       SET contrasena = ?, estado = 2 
       WHERE id_usuario = ?`,
      [hashedPassword, id_usuario]
    );
  }
};

export const deleteTokenById = async (id_token) => {
  await pool.query(`DELETE FROM tokens_autenticacion WHERE id_token = ?`, [id_token]);
};

export const findUsuarioActivoByEmail = async (correo_usuario) => {
  const [rows] = await pool.query(
    `SELECT id_usuario FROM usuarios WHERE correo_usuario = ? AND estado = 2`,
    [correo_usuario]
  );
  return rows.length > 0;
};

// Incluimos u.estado y u.correo_usuario para que el controlador arme la respuesta completa
export const findUsuarioLoginByEmail = async (correo_usuario) => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.correo_usuario, u.contrasena, u.estado,
            c.categoria_usuario AS role
     FROM usuarios u
     INNER JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario 
     WHERE u.correo_usuario = ?`,
    [correo_usuario]
  );
  return rows[0];
};

// Incluimos t.intentos para la validación de límite en el controlador
export const findClienteTokenByHash = async (tokenHash) => {
  const [rows] = await pool.query(
    `SELECT t.id_token, t.id_usuario, t.intentos,
            TIMESTAMPDIFF(HOUR, t.fecha_creacion, NOW()) AS horas_transcurridas
     FROM tokens_autenticacion t
     INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
     WHERE t.token = ? 
       AND t.tipo_token = 'REGISTRO' 
       AND u.estado = 1
     ORDER BY t.fecha_creacion DESC
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0];
};

const authModel = {
  findTecnicoTokenByEmail,
  incrementarIntentosToken,
  updateUsuarioActivo,
  deleteTokenById,
  findUsuarioActivoByEmail,
  findUsuarioLoginByEmail,
  findClienteTokenByHash
};

export default authModel;