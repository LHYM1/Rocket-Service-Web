const jwt = require("jsonwebtoken");

// Protección de rutas
const validarToken = (req, res, next) => {
    // El token suele enviarse en el header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ mensaje: "Acceso denegado. No hay token." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Si pasó más de 1 minuto, 'err' contendrá la información de la expiración
            return res.status(403).json({ mensaje: "Token expirado o inválido" });
        }
        req.user = user;
        next(); // Si es válido, continúa a la función de la ruta
    });
};

module.exports = { validarToken };