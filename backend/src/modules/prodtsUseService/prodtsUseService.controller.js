import prodtsUseService from './prodtsUseService.model.js';
import ordenes_de_servicio from '../orders/orders.model.js';

// HU-004.7 -- Admin: todos los insumos usados, con filtros por orden y técnico
export const listarInsumosUsadosAdmin = async (req, res) => {
    try {
        const { id_orden, tecnico } = req.query;
        const resultado = await prodtsUseService.findAllAdmin({ id_orden, tecnico });
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-004.7 -- Técnico: solo los insumos de sus propias órdenes
export const listarMisInsumos = async (req, res) => {
    try {
        const { id: id_tecnico } = req.user; // provisto por authMiddleware (payload del JWT)
        const { id_orden } = req.query;
        const resultado = await prodtsUseService.findAllTecnico(id_tecnico, { id_orden });
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.9 -- CA-001: agregar un insumo a una orden (Cotización)
export const agregarInsumoAOrden = async (req, res) => {
    try {
        const { id: id_tecnico } = req.user;
        const { id_orden, id_insumo, cantidad } = req.body;

        if (!id_orden || !id_insumo || !cantidad) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        const orden = await ordenes_de_servicio.findById(id_orden);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada." });

        // RN-001: solo el técnico asignado
        if (orden.id_tecnico_asignado !== id_tecnico) {
            return res.status(403).json({ message: "No autorizado para modificar esta orden." });
        }
        // CA-006 / RN-007: solo si está EN PROCESO
        if (orden.nombre_estado !== "EN PROCESO") {
            return res.status(400).json({ message: "Solo se pueden agregar insumos a una orden EN PROCESO." });
        }

        // RN-002 / CA-005: insumo debe existir y estar activo
        const insumo = await prodtsUseService.getInsumoActivo(id_insumo);
        if (!insumo || insumo.estado !== 1) {
            return res.status(400).json({ message: "El insumo no está disponible." });
        }

        // RN-003 / CA-003: cantidad válida y no supera el stock
        const cant = Number(cantidad);
        if (!Number.isInteger(cant) || cant <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número entero mayor a cero." });
        }
        if (cant > insumo.cantidad_disponible) {
            return res.status(400).json({ message: "La cantidad solicitada supera el stock disponible." });
        }

        // RN-004 / CA-002: no duplicar
        const yaEsta = await prodtsUseService.yaEstaAgregado(id_orden, id_insumo);
        if (yaEsta) {
            return res.status(409).json({ message: "Este insumo ya fue agregado a la orden." });
        }

        // RN-005: precio snapshot al momento de agregar
        await prodtsUseService.agregarInsumoAOrden(id_orden, id_insumo, cant, insumo.precio_unitario);

        res.status(201).json({ message: "Insumo agregado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-006.9 -- RN-006: quitar un insumo de una orden (devuelve el stock)
export const quitarInsumoDeOrden = async (req, res) => {
    try {
        const { id: id_tecnico } = req.user;
        const { id_insumos_orden } = req.params;

        const registro = await prodtsUseService.findInsumoUsadoPorId(id_insumos_orden);
        if (!registro) return res.status(404).json({ message: "Registro no encontrado." });

        const orden = await ordenes_de_servicio.findById(registro.id_orden);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada." });

        if (orden.id_tecnico_asignado !== id_tecnico) {
            return res.status(403).json({ message: "No autorizado para modificar esta orden." });
        }
        // RN-007
        if (orden.nombre_estado === "FINALIZADA" || orden.nombre_estado === "CANCELADA") {
            return res.status(400).json({ message: `No se pueden modificar insumos de una orden ${orden.nombre_estado}.` });
        }

        await prodtsUseService.quitarInsumoDeOrden(id_insumos_orden, registro.id_insumo, registro.cantidad);
        res.json({ message: "Insumo eliminado y stock restaurado." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ajustar cantidad de un insumo ya agregado (botones +/- en la Cotización)
export const actualizarCantidadInsumo = async (req, res) => {
    try {
        const { id: id_tecnico } = req.user;
        const { id_insumos_orden } = req.params;
        const { nueva_cantidad } = req.body;

        const cant = Number(nueva_cantidad);
        if (!Number.isInteger(cant) || cant <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número entero mayor a cero." });
        }

        const registro = await prodtsUseService.findInsumoUsadoPorId(id_insumos_orden);
        if (!registro) return res.status(404).json({ message: "Registro no encontrado." });

        const orden = await ordenes_de_servicio.findById(registro.id_orden);
        if (!orden) return res.status(404).json({ message: "Orden no encontrada." });

        if (orden.id_tecnico_asignado !== id_tecnico) {
            return res.status(403).json({ message: "No autorizado para modificar esta orden." });
        }
        if (orden.nombre_estado !== "EN PROCESO") {
            return res.status(400).json({ message: "Solo se pueden ajustar insumos de una orden EN PROCESO." });
        }

        const diferencia = cant - registro.cantidad;
        if (diferencia > 0) {
            const insumo = await prodtsUseService.getInsumoActivo(registro.id_insumo);
            if (diferencia > insumo.cantidad_disponible) {
                return res.status(400).json({ message: "No hay suficiente stock disponible para aumentar esa cantidad." });
            }
        }

        await prodtsUseService.actualizarCantidad(id_insumos_orden, cant, registro.id_insumo, registro.cantidad);
        res.json({ message: "Cantidad actualizada correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { listarInsumosUsadosAdmin, listarMisInsumos, agregarInsumoAOrden, quitarInsumoDeOrden, actualizarCantidadInsumo };