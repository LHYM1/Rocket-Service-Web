import ordenes_de_servicio from './orders.model.js';
import preRevision from '../preRevision/preRevision.model.js';
import prodtsUseService from '../prodtsUseService/prodtsUseService.model.js';

const ESTADOS_VALIDOS = ["ASIGNADA", "PENDIENTE APROBACIÓN", "EN PROCESO", "FINALIZADA", "CANCELADA"];

// HU-006.2 -- Consultar Orden (listado según rol)
export const listarOrden = async (req, res) => {
    try {
        const { role: rol, id: id_usuario } = req.user;
        const { codigo_orden, estado, id_tecnico } = req.query;

        let ordenes;
        if (rol === "Administrador") {
            // RN-001 / RN-003: el Admin ve todas, con filtro adicional por técnico
            ordenes = await ordenes_de_servicio.findAll({ codigo_orden, estado, id_tecnico });
        } else if (rol === "Técnico") {
            // RN-002: el Técnico ve solo sus propias órdenes asignadas
            ordenes = await ordenes_de_servicio.findAllByTecnico(id_usuario, { codigo_orden, estado });
        } else if (rol === "Cliente") {
            // HU-006.10: el Cliente ve solo sus propias órdenes
            ordenes = await ordenes_de_servicio.findAllByCliente(id_usuario);
        } else {
            return res.status(403).json({ message: "No autorizado" });
        }

        res.json(ordenes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar ordenes' });
    }
};

export const obtenerOrden = async (req, res) => {
    try {
        const orden = await ordenes_de_servicio.findById(req.params.id);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada" });

        // Se incluyen los insumos cotizados y el total -- útil para HU-006.10 (aprobar/rechazar)
        const insumos = await prodtsUseService.findInsumosDeOrden(req.params.id);
        const total = await prodtsUseService.totalCotizado(req.params.id);

        res.json({ ...orden, insumos, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Para el selector del formulario de creación (HU-006.1, CA-003)
export const listarTecnicosDisponibles = async (req, res) => {
    try {
        const tecnicos = await ordenes_de_servicio.getTecnicosDisponibles();
        res.json(tecnicos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.1 -- Crear Orden de Servicio (RN-002: siempre a partir de una Pre-revisión)
export const crearOrden = async (req, res) => {
    try {
        const { id_pre_revision, id_tecnico_asignado, fecha_finalizacion_estimada } = req.body;

        if (!id_pre_revision || !id_tecnico_asignado || !fecha_finalizacion_estimada) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // RN-002: debe existir la pre-revisión, con resultado "Requiere reparación",
        // ya completada, y que todavía no tenga una orden generada
        const pr = await preRevision.findById(id_pre_revision);
        if (!pr) {
            return res.status(404).json({ message: "Pre-revisión no encontrada." });
        }
        if (pr.estado !== "COMPLETADA" || pr.resultado !== "Requiere reparación") {
            return res.status(400).json({ message: "Esta pre-revisión no requiere la creación de una orden." });
        }
        if (pr.id_orden_generada) {
            return res.status(400).json({ message: "Esta pre-revisión ya generó una orden de servicio." });
        }

        // RN-007 / CA-004: la fecha de entrega debe ser futura
        const fechaEntrega = new Date(fecha_finalizacion_estimada);
        if (isNaN(fechaEntrega.getTime()) || fechaEntrega <= new Date()) {
            return res.status(400).json({ message: "La fecha de entrega debe ser una fecha futura." });
        }

        // RN-006 / CA-003: el técnico debe existir y estar disponible
        const tecnicoValido = await ordenes_de_servicio.esTecnicoValido(id_tecnico_asignado);
        if (!tecnicoValido) {
            return res.status(400).json({ message: "No hay técnicos disponibles actualmente." });
        }

        // RN-003: código automático ORD-XXX
        const codigo_orden = await ordenes_de_servicio.generarCodigoOrden();

        // RN-004: el estado inicial siempre es ASIGNADA
        const id_estado_de_servicio = await ordenes_de_servicio.getEstadoIdPorNombre("ASIGNADA");
        if (!id_estado_de_servicio) {
            return res.status(500).json({ message: "No se encontró el estado ASIGNADA en el catálogo de estados." });
        }

        // RN-005: cliente, moto, tipo de servicio y observaciones se copian de la pre-revisión.
        // La fecha de creación de la orden hereda la fecha de la pre-revisión (a pedido del equipo).
        const idOrdenGenerada = await ordenes_de_servicio.create({
            codigo_orden,
            id_moto: pr.id_moto,
            id_usuario: pr.id_usuario,
            id_tecnico_asignado,
            id_tipo_servicio: pr.id_tipo_servicio,
            id_estado_de_servicio,
            fecha_finalizacion_estimada,
            descripcion_del_problema: pr.observaciones,
            fecha_de_creacion: pr.fecha_pre_revision
        });

        await preRevision.marcarOrdenGenerada(id_pre_revision, idOrdenGenerada);

        res.status(201).json({ message: "Orden creada correctamente", codigo_orden });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.3 -- Actualizar Orden (campos permitidos según rol)
export const actualizarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: rol, id: id_usuario_actual } = req.user;

        const ordenActual = await ordenes_de_servicio.findById(id);
        if (!ordenActual) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // RN-002: el Técnico solo puede actualizar sus propias órdenes asignadas
        if (rol === "Técnico" && ordenActual.id_tecnico_asignado !== id_usuario_actual) {
            return res.status(403).json({ message: "No autorizado para modificar esta orden." });
        }

        // Bloqueado si ya no tiene sentido modificarla: finalizada, cancelada,
        // o esperando la respuesta del cliente sobre la cotización ya enviada.
        // EN PROCESO SÍ se permite -- es justo cuando el Técnico está trabajando la cotización.
        if (["FINALIZADA", "CANCELADA", "PENDIENTE APROBACIÓN"].includes(ordenActual.nombre_estado)) {
            return res.status(400).json({
                message: `No se puede modificar una orden en estado ${ordenActual.nombre_estado}.`
            });
        }

        // RN-004: descripción máximo 200 caracteres
        if (req.body.descripcion_del_problema && req.body.descripcion_del_problema.length > 200) {
            return res.status(400).json({ message: "La descripción del problema supera los 200 caracteres." });
        }

        let datosActualizar = {};

        if (rol === "Administrador") {
            // RN-001: el Admin puede actualizar todos los campos
            const { codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio, fecha_finalizacion_estimada, descripcion_del_problema } = req.body;
            datosActualizar = { codigo_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio, fecha_finalizacion_estimada, descripcion_del_problema };
        } else if (rol === "Técnico") {
            // Descripción funcional: el Técnico solo puede tocar tipo de servicio,
            // descripción, fecha de entrega y estado
            const { id_tipo_servicio, fecha_finalizacion_estimada, descripcion_del_problema, id_estado_de_servicio } = req.body;
            datosActualizar = { id_tipo_servicio, fecha_finalizacion_estimada, descripcion_del_problema, id_estado_de_servicio };
        } else {
            return res.status(403).json({ message: "No autorizado" });
        }

        // Quitar campos undefined para no sobrescribir con NULL sin querer
        Object.keys(datosActualizar).forEach(k => datosActualizar[k] === undefined && delete datosActualizar[k]);

        const actualizado = await ordenes_de_servicio.update(id, datosActualizar);
        if (!actualizado) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.json({ message: "Orden de servicio actualizada exitosamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.4 -- Cancelar Orden (reemplaza la eliminación física)
export const cancelarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const orden = await ordenes_de_servicio.findById(id);
        if (!orden) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // No se pueden cancelar órdenes FINALIZADAS ni ya CANCELADAS
        if (orden.nombre_estado === "FINALIZADA" || orden.nombre_estado === "CANCELADA") {
            return res.status(400).json({
                message: `No se puede cancelar una orden en estado ${orden.nombre_estado}.`
            });
        }

        // Si está EN PROCESO, el motivo es obligatorio
        if (orden.nombre_estado === "EN PROCESO" && (!motivo || motivo.trim() === "")) {
            return res.status(400).json({
                message: "Debes indicar un motivo para cancelar una orden que está EN PROCESO."
            });
        }

        const idEstadoCancelada = await ordenes_de_servicio.getEstadoIdPorNombre("CANCELADA");
        if (!idEstadoCancelada) {
            return res.status(500).json({ message: "No se encontró el estado CANCELADA en el catálogo de estados." });
        }

        await ordenes_de_servicio.cancelar(id, idEstadoCancelada);
        await ordenes_de_servicio.devolverInsumosAlStock(id);
        await ordenes_de_servicio.desactivarMoto(orden.id_moto);

        res.json({ message: "Orden cancelada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── HU-006.7: transiciones de estado exclusivas del Técnico asignado ──

async function validarTecnicoDeLaOrden(id, id_tecnico_actual) {
    const orden = await ordenes_de_servicio.findById(id);
    if (!orden) return { error: 404, message: "Orden no encontrada" };
    if (orden.id_tecnico_asignado !== id_tecnico_actual) {
        return { error: 403, message: "No autorizado: no eres el técnico asignado a esta orden." };
    }
    // RN-003 / CA-006
    if (orden.nombre_estado === "FINALIZADA" || orden.nombre_estado === "CANCELADA") {
        return { error: 400, message: `No se puede modificar una orden en estado ${orden.nombre_estado}.` };
    }
    return { orden };
}

// CA-001: ASIGNADA -> EN PROCESO
export const aceptarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: id_tecnico } = req.user;

        const check = await validarTecnicoDeLaOrden(id, id_tecnico);
        if (check.error) return res.status(check.error).json({ message: check.message });

        if (check.orden.nombre_estado !== "ASIGNADA") {
            return res.status(400).json({ message: "Solo se pueden aceptar órdenes en estado ASIGNADA." });
        }

        const idEstado = await ordenes_de_servicio.getEstadoIdPorNombre("EN PROCESO");
        await ordenes_de_servicio.cambiarEstado(id, idEstado);
        await ordenes_de_servicio.marcarDisponibilidad(id_tecnico, "Realizando servicio");
        res.json({ message: "Orden aceptada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CA-002: EN PROCESO -> PENDIENTE APROBACIÓN
export const enviarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: id_tecnico } = req.user;

        const check = await validarTecnicoDeLaOrden(id, id_tecnico);
        if (check.error) return res.status(check.error).json({ message: check.message });

        if (check.orden.nombre_estado !== "EN PROCESO") {
            return res.status(400).json({ message: "Solo se puede enviar cotización de una orden EN PROCESO." });
        }

        const idEstado = await ordenes_de_servicio.getEstadoIdPorNombre("PENDIENTE APROBACIÓN");
        await ordenes_de_servicio.cambiarEstado(id, idEstado);
        res.json({ message: "Cotización enviada al cliente correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CA-004: EN PROCESO -> FINALIZADA (y el técnico queda disponible, RN-005)
export const finalizarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: id_tecnico } = req.user;

        const check = await validarTecnicoDeLaOrden(id, id_tecnico);
        if (check.error) return res.status(check.error).json({ message: check.message });

        if (check.orden.nombre_estado !== "EN PROCESO") {
            return res.status(400).json({ message: "Solo se puede finalizar una orden que está EN PROCESO." });
        }

        const idEstado = await ordenes_de_servicio.getEstadoIdPorNombre("FINALIZADA");
        await ordenes_de_servicio.cambiarEstado(id, idEstado);
        await ordenes_de_servicio.marcarTecnicoDisponible(id_tecnico, id);

        res.json({ message: "Orden finalizada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── HU-006.10: el Cliente aprueba o rechaza la cotización ──

// CA-001: PENDIENTE APROBACIÓN -> EN PROCESO
export const aprobarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: id_cliente } = req.user;

        const orden = await ordenes_de_servicio.findById(id);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada." });

        // RN-001
        if (orden.id_usuario !== id_cliente) {
            return res.status(403).json({ message: "No autorizado para aprobar esta orden." });
        }
        // RN-002
        if (orden.nombre_estado !== "PENDIENTE APROBACIÓN") {
            return res.status(400).json({ message: "Esta orden no tiene una cotización pendiente de aprobación." });
        }

        const idEstado = await ordenes_de_servicio.getEstadoIdPorNombre("EN PROCESO");
        await ordenes_de_servicio.cambiarEstado(id, idEstado);

        res.json({ message: "Has aprobado la cotización. Tu moto está en proceso de reparación." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CA-002 / CA-003: rechazo -> Cancelar orden, o Devolver al técnico para reajuste
export const rechazarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: id_cliente } = req.user;
        const { tipo_rechazo, motivo } = req.body;

        const orden = await ordenes_de_servicio.findById(id);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada." });

        if (orden.id_usuario !== id_cliente) {
            return res.status(403).json({ message: "No autorizado para rechazar esta orden." });
        }
        if (orden.nombre_estado !== "PENDIENTE APROBACIÓN") {
            return res.status(400).json({ message: "Esta orden no tiene una cotización pendiente de aprobación." });
        }

        // RN-004 / CA-004: motivo obligatorio
        if (!motivo || motivo.trim() === "") {
            return res.status(400).json({ message: "Debe ingresar el motivo de su rechazo." });
        }
        if (!["Cancelar", "Reajuste"].includes(tipo_rechazo)) {
            return res.status(400).json({ message: "El tipo de rechazo debe ser 'Cancelar' o 'Reajuste'." });
        }

        if (tipo_rechazo === "Cancelar") {
            // RN-005 / CA-002: cancelar, insumos vuelven al stock, moto se desactiva
            const idEstado = await ordenes_de_servicio.getEstadoIdPorNombre("CANCELADA");
            await ordenes_de_servicio.cambiarEstado(id, idEstado);
            await ordenes_de_servicio.guardarMotivoRechazo(id, motivo);
            await ordenes_de_servicio.devolverInsumosAlStock(id);
            await ordenes_de_servicio.desactivarMoto(orden.id_moto);
            return res.json({ message: "La orden fue cancelada. El motivo fue enviado al administrador." });
        }

        // RN-006 / CA-003: reajuste -> vuelve a EN PROCESO con el motivo para el técnico
        const idEstado = await ordenes_de_servicio.getEstadoIdPorNombre("EN PROCESO");
        await ordenes_de_servicio.cambiarEstado(id, idEstado);
        await ordenes_de_servicio.guardarMotivoRechazo(id, motivo);

        res.json({ message: "Se solicitó un reajuste. El técnico recibirá tu motivo para ajustar la cotización." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarOrden,
    obtenerOrden,
    listarTecnicosDisponibles,
    crearOrden,
    actualizarOrden,
    cancelarOrden,
    aceptarOrden,
    enviarCotizacion,
    finalizarOrden,
    aprobarCotizacion,
    rechazarCotizacion
};