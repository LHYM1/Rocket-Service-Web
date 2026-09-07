import calificaciones from './calificaciones.model.js';
import db from '../../config/db.js';

// HU-012.1 -- Calificar servicio (Cliente)
export const calificarServicio = async (req, res) => {
    try {
        const { id_orden } = req.params;
        const { id: id_usuario_actual } = req.user;
        const { calificacion, comentario } = req.body;

        // RN-003: calificación obligatoria, entero 1-5
        const calif = Number(calificacion);
        if (!Number.isInteger(calif) || calif < 1 || calif > 5) {
            return res.status(400).json({ message: "La calificación debe ser un número entero entre 1 y 5 estrellas." });
        }

        // RN-004: comentario opcional, máximo 300 caracteres
        if (comentario && comentario.length > 300) {
            return res.status(400).json({ message: "El comentario no puede superar los 300 caracteres." });
        }

        // Buscar la orden y validar que sea del cliente autenticado y esté FINALIZADA (RN-001)
        const [ordenRows] = await db.query(
            `SELECT o.id_orden, o.id_usuario, o.id_tecnico_asignado, e.nombre_estado
             FROM ordenes_de_servicio o
             LEFT JOIN estado_de_orden_de_servicio e ON o.id_estado_de_servicio = e.id_estado_de_servicio
             WHERE o.id_orden = ?`,
            [id_orden]
        );
        const orden = ordenRows[0];

        if (!orden) {
            return res.status(404).json({ message: "Orden no encontrada." });
        }
        if (orden.id_usuario !== id_usuario_actual) {
            return res.status(403).json({ message: "No autorizado para calificar esta orden." });
        }
        if (orden.nombre_estado !== "FINALIZADA") {
            return res.status(400).json({ message: "Solo puedes calificar órdenes finalizadas." });
        }

        // RN-002: solo una vez por orden
        const yaCalifico = await calificaciones.yaCalifico(id_orden);
        if (yaCalifico) {
            return res.status(409).json({ message: "Ya calificaste esta orden." });
        }

        await calificaciones.crear({
            id_orden,
            id_tecnico: orden.id_tecnico_asignado,
            id_usuario: id_usuario_actual,
            calificacion: calif,
            comentario
        });

        res.status(201).json({ message: "¡Gracias por tu calificación! Te esperamos de nuevo en Rocket Service." });
    } catch (error) {
        // Respaldo por si la restricción UNIQUE de la BD detecta una doble calificación
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Ya calificaste esta orden." });
        }
        res.status(500).json({ error: error.message });
    }
};

export const obtenerCalificacionDeOrden = async (req, res) => {
    try {
        const calif = await calificaciones.findByOrden(req.params.id_orden);
        res.json(calif); // null si no ha calificado -- el frontend decide qué mostrar
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// RN-005: promedio del técnico, para dashboard y perfil
export const obtenerPromedioTecnico = async (req, res) => {
    try {
        const promedio = await calificaciones.promedioPorTecnico(req.params.id_tecnico);
        res.json(promedio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { calificarServicio, obtenerCalificacionDeOrden, obtenerPromedioTecnico };