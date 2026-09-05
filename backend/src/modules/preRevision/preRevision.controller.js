import preRevision from './preRevision.model.js';

// HU-006.8 -- RN-001: solo el Admin crea pre-revisiones
export const crearPreRevision = async (req, res) => {
    try {
        const { id_usuario, id_moto, id_tecnico_asignado, fecha_pre_revision } = req.body;

        if (!id_usuario || !id_moto || !id_tecnico_asignado || !fecha_pre_revision) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // RN-002 / CA-006: el técnico debe existir y estar disponible
        const tecnicoValido = await preRevision.esTecnicoValido(id_tecnico_asignado);
        if (!tecnicoValido) {
            return res.status(400).json({ message: "No hay técnicos disponibles actualmente." });
        }

        await preRevision.create({ id_usuario, id_moto, id_tecnico_asignado, fecha_pre_revision });

        // Al asignarle una pre-revisión, el técnico pasa a "Realizando servicio"
        await preRevision.marcarDisponibilidad(id_tecnico_asignado, "Realizando servicio");

        res.status(201).json({ message: "Pre-revisión creada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.8 -- listado según rol
export const listarPreRevision = async (req, res) => {
    try {
        const { role: rol, id: id_usuario } = req.user;
        const { estado } = req.query;

        let resultado;
        if (rol === "Administrador") {
            resultado = await preRevision.findAllAdmin({ estado });
        } else if (rol === "Técnico") {
            resultado = await preRevision.findAllByTecnico(id_usuario);
        } else {
            return res.status(403).json({ message: "No autorizado" });
        }

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerPreRevision = async (req, res) => {
    try {
        const pr = await preRevision.findById(req.params.id);
        if (!pr) return res.status(404).json({ message: "Pre-revisión no encontrada" });
        res.json(pr);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Subir una foto (Técnico) -- archivo real, guardado en /uploads/ igual que imagenes_danos
export const agregarFotoPreRevision = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No se seleccionó ninguna imagen." });
        }

        const pr = await preRevision.findById(id);
        if (!pr) return res.status(404).json({ message: "Pre-revisión no encontrada" });

        const url_imagen = `/uploads/${req.file.filename}`;
        await preRevision.agregarFoto(id, url_imagen);
        res.status(201).json({ message: "Foto agregada correctamente.", url_imagen });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.8 -- RN-003/004/005: el Técnico confirma el resultado
export const completarPreRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: id_tecnico_actual } = req.user;
        const { observaciones, id_tipo_servicio, resultado } = req.body;

        const pr = await preRevision.findById(id);
        if (!pr) return res.status(404).json({ message: "Pre-revisión no encontrada" });

        if (pr.id_tecnico_asignado !== id_tecnico_actual) {
            return res.status(403).json({ message: "No autorizado para completar esta pre-revisión." });
        }

        if (!observaciones || observaciones.trim() === "") {
            return res.status(400).json({ message: "Las observaciones son obligatorias." });
        }
        if (!id_tipo_servicio) {
            return res.status(400).json({ message: "El tipo de servicio es obligatorio." });
        }
        if (!["Requiere reparación", "No requiere reparación"].includes(resultado)) {
            return res.status(400).json({ message: "El resultado debe ser 'Requiere reparación' o 'No requiere reparación'." });
        }

        // RN-003 / CA-003: mínimo una foto antes de confirmar
        const totalFotos = await preRevision.contarFotos(id);
        if (totalFotos === 0) {
            return res.status(400).json({ message: "Debe adjuntar al menos una foto antes de confirmar el resultado." });
        }

        // RN-004 / RN-005
        const nuevoEstado = resultado === "Requiere reparación" ? "COMPLETADA" : "FINALIZADA";
        await preRevision.completar(id, { observaciones, id_tipo_servicio, resultado, nuevoEstado });

        // Al terminar la pre-revisión, el técnico vuelve a estar disponible (mientras espera que el Admin cree la orden)
        await preRevision.marcarDisponibilidad(id_tecnico_actual, "Disponible");

        const mensaje = resultado === "Requiere reparación"
            ? "Pre-revisión completada. Se ha notificado al Administrador para crear la orden de servicio."
            : "Pre-revisión finalizada correctamente.";

        res.json({ message: mensaje });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Para el "aviso" al Admin (CA-005): pre-revisiones que ya requieren una orden
export const listarPendientesDeOrden = async (req, res) => {
    try {
        const pendientes = await preRevision.findPendientesDeOrden();
        res.json(pendientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Utilidad para pruebas: eliminar una pre-revisión que aún no se completó
export const eliminarPreRevision = async (req, res) => {
    try {
        const eliminado = await preRevision.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(400).json({ message: "Solo se pueden eliminar pre-revisiones en estado PENDIENTE." });
        }
        res.json({ message: "Pre-revisión eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    crearPreRevision,
    listarPreRevision,
    obtenerPreRevision,
    agregarFotoPreRevision,
    completarPreRevision,
    listarPendientesDeOrden,
    eliminarPreRevision
};