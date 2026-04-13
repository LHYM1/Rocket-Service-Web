
import estadoOrdn from './estadoOrdn.model.js';

export const listarEstdOrden = async (req, res) => {

    try {
        const estOrden = await estadoOrdn.findAll();
        res.json(estOrden);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar estados de orden' });
    }
};

export const obtenerEstdOrden = async (req, res) => {
    try {
        const estOrden = await estadoOrdn.findById(req.params.id);
        if (!estOrden) return res.status(404).json({ message: "Estados de orden no encontrados" });
        res.json(estOrden);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearEstdOrden = async (req, res) => {
    try {
        const { nombre_estado } = req.body; // Campos DB

        if (!nombre_estado) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await estadoOrdn.create(req.body);

        res.status(201).json({ 
            message: "Registo de estado orden creado correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarEstOrden = async (req, res) => {
    try {
        const actualizado = await estadoOrdn.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Registro de estado orden no encontrado" });
        }
        res.json({ message: "Registro de estado orden actualizado correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarEstdOrd = async (req, res) => {
    try {
        const eliminado = await estadoOrdn.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Registro de estado orden no encontrado" 
            });
        res.json({ message: "Registro de estado orden eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarEstdOrden,
    obtenerEstdOrden,   
    crearEstdOrden,
    actualizarEstOrden,
    eliminarEstdOrd
};


