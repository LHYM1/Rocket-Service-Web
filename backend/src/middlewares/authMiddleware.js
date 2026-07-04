import jwt from 'jsonwebtoken';

// Middleware 1: solo valida que el token exista y sea válido
export const validarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // guarda el usuario decodificado en req.user
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

// Middleware 2: verifica que el rol del usuario esté en los roles permitidos
export const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ message: "No tienes permisos para esta acción" });
        }

        next();
    };
};