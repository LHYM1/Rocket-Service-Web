import jwt from 'jsonwebtoken';

export const validarToken = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Acceso no autorizado. Token requerido." });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const rolUsuario = typeof decoded.role === 'string' ? decoded.role.normalize('NFC') : decoded.role;
      const rolesNormalizados = rolesPermitidos.map(r => typeof r === 'string' ? r.normalize('NFC') : r);

      if (rolesNormalizados.length > 0 && !rolesNormalizados.includes(rolUsuario)) {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción." });
      }

      req.user = decoded;
      next();

    } catch (error) {
      return res.status(401).json({ message: "Token inválido o expirado." });
    }
  };
};

export default { validarToken };