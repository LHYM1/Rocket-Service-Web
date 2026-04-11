
import ordenes_de_servicio from './orders.model.js';

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
        const { codigo_orden , id_moto , id_usuario , id_tecnico_asignado, id_tipo_servicio , id_estado_de_servicio, fecha_finalizacion_estimada, descripcion_del_problema } = req.body; // Campos que se envian desde el frontend

        if (!codigo_orden || !id_moto || !id_usuario || !id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio, fecha_finalizacion_estimada, descripcion_del_problema) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await ordenes_de_servicio.create(req.body);

        res.status(201).json({ 
            message: "Orden creada correctamente",
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

export default {
    listarOrden,
    obtenerOrden,   
    crearOrden,
    actualizarOrden,
    eliminarOrden
};


