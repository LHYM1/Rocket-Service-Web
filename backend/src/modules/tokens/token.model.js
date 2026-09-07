import db from '../../config/db.js';

const tokenModel = {
  // 1. Buscar token por su Hash SHA-256 validando fecha_expiracion
  findTokenByHash: async (tokenHash) => {
    const query = `
      SELECT 
        id_token,
        id_usuario,
        token,
        tipo_token,
        fecha_creacion,
        fecha_expiracion,
        intentos,
        IF(NOW() > fecha_expiracion, 25, 0) AS horas_transcurridas
      FROM tokens_autenticacion
      WHERE token = ? AND tipo_token = 'REGISTRO'
    `;
    const [rows] = await db.query(query, [tokenHash]);
    return rows[0] || null;
  },

  // 2. Incrementar contador de intentos fallidos
  findAndIncrementAttempts: async (id_token) => {
    const query = `
      UPDATE tokens_autenticacion 
      SET intentos = intentos + 1 
      WHERE id_token = ?
    `;
    const [result] = await db.query(query, [id_token]);
    return result.affectedRows > 0;
  },

  // 3. Eliminar token por ID
  findAndDeleteById: async (id_token) => {
    const query = `
      DELETE FROM tokens_autenticacion 
      WHERE id_token = ?
    `;
    const [result] = await db.query(query, [id_token]);
    return result.affectedRows > 0;
  }
};

export default tokenModel;