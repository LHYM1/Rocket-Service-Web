import notificaciones from './notificaciones.model.js';

// Cualquier usuario autenticado puede notificar al Admin de algo puntual
export const crearNotificacion = async (req, res) => {
    try {
        const { id: id_usuario_origen } = req.user;
        const { mensaje } = req.body;

        if (!mensaje || mensaje.trim() === "") {
            return res.status(400).json({ message: "El mensaje es obligatorio." });
        }

        await notificaciones.crear(id_usuario_origen, mensaje);
        res.status(201).json({ message: "Se notificó al Administrador correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// El Admin consulta lo pendiente (por ejemplo, al iniciar sesión)
export const listarParaAdmin = async (req, res) => {
    try {
        const pendientes = await notificaciones.listarNoLeidasParaAdmin();
        res.json(pendientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const marcarLeidas = async (req, res) => {
    try {
        await notificaciones.marcarTodasLeidas();
        res.json({ message: "Notificaciones marcadas como leídas." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Notificaciones por orden, para el badge de "Evidencias" del Cliente ──

export const obtenerNoLeidasPorOrden = async (req, res) => {
    try {
        const { id: id_usuario } = req.user;
        const resultado = await notificaciones.contarNoLeidasPorOrden(id_usuario);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const marcarLeidasDeOrden = async (req, res) => {
    try {
        const { id: id_usuario } = req.user;
        const { id_orden } = req.params;
        await notificaciones.marcarLeidasDeOrden(id_usuario, id_orden);
        res.json({ message: "Notificaciones de esta orden marcadas como leídas." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    crearNotificacion,
    listarParaAdmin,
    marcarLeidas,
    obtenerNoLeidasPorOrden,
    marcarLeidasDeOrden
};