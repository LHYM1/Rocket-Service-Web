import jwt from 'jsonwebtoken';

// Protección de rutas
export const validarToken = (roles) => {
    return (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      // .normalize("NFC") evita falsos negativos cuando una tilde (como en "Técnico")
      // viene representada con una codificación Unicode distinta a la esperada.
      const rolDecoded = typeof decoded.role === "string" ? decoded.role.normalize("NFC") : decoded.role;
      const rolesNormalizados = roles.map(r => typeof r === "string" ? r.normalize("NFC") : r);

      if (!rolesNormalizados.includes(rolDecoded)) {
        return res.status(403).json({ message: "No autorizado" });
      }

      next();

    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

export default { validarToken };