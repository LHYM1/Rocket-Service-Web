
import ordenes_de_servicio from './orders.model.js';
import db from '../../config/db.js';

export const terminarRevision = async (req, res) => {
    try {
        const { id_tipo_servicio, descripcion_del_problema } = req.body;
        if (!id_tipo_servicio || !descripcion_del_problema) {
            return res.status(400).json({ message: "Tipo de servicio y descripción son obligatorios" });
        }
        const actualizado = await ordenes_de_servicio.updateRevision(req.params.id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Orden no encontrada" });
        res.json({ message: "Revisión completada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarEstadoPorTecnico = async (req, res) => {
    try {
        const { id_estado_de_servicio } = req.body;
        const actualizado = await ordenes_de_servicio.updateEstadoByTecnico(req.params.idTecnico, id_estado_de_servicio);
        res.json({ message: "Estado actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarEstadoOrden = async (req, res) => {
    try {
        const { id_estado_de_servicio } = req.body;
        const actualizado = await ordenes_de_servicio.updateEstado(req.params.id, id_estado_de_servicio);
        if (!actualizado) return res.status(404).json({ message: "Orden no encontrada" });
        res.json({ message: "Estado actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarOrden = async (req, res) => {

    try {
        const ordenes = await ordenes_de_servicio.findAll();
        res.json(ordenes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar ordenes' });
    }
};

export const obtenerOrden = async (req, res) => {
    try {
        const ordenes = await ordenes_de_servicio.findById(req.params.id);
        if (!ordenes) return res.status(404).json({ message: "orden no encontrada" });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearOrden = async (req, res) => {
    try {
        const { 
            id_moto, id_usuario, id_tecnico_asignado, 
            id_estado_de_servicio, fecha_finalizacion_estimada 
        } = req.body;

        if (!id_moto || !id_usuario || !id_tecnico_asignado || !id_estado_de_servicio || !fecha_finalizacion_estimada) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        // Generar código automático ORD-001, ORD-002...
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM ordenes_de_servicio'
        );
        const total = rows[0].total + 1;
        const codigo_orden = `ORD-${String(total).padStart(3, '0')}`;

        const id = await ordenes_de_servicio.create({ 
            ...req.body, 
            codigo_orden 
        });

        res.status(201).json({ 
            message: "Orden creada correctamente",
            codigo_orden
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarOrden = async (req, res) => {
    try {
        const actualizado = await ordenes_de_servicio.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.json({ message: "Orden actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarOrden = async (req, res) => {
    try {
        const eliminado = await ordenes_de_servicio.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Orden no encontrada" 
            });
        res.json({ message: "Orden eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agregar esta función antes del export default
export const listarMisOrdenes = async (req, res) => {
    try {
        const idTecnico = req.user.id; // viene del token decodificado
        const ordenes = await ordenes_de_servicio.findByTecnico(idTecnico);
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar mis órdenes' });
    }
};

export default {
    listarOrden,
    obtenerOrden,
    crearOrden,
    actualizarOrden,
    eliminarOrden,
    listarMisOrdenes,
    actualizarEstadoOrden,
    actualizarEstadoPorTecnico,
    terminarRevision
};


