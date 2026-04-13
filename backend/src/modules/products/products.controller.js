
import insumos from './products.model.js';

export const listarInsumo = async (req, res) => {

    try {
        const insm = await insumos.findAll();
        res.json(insm);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar Insumos' });
    }
};

export const obtenerInsumo = async (req, res) => {
    try {
        const insm = await insumos.findById(req.params.id);
        if (!insm) return res.status(404).json({ message: "Insumo no encontrado" });
        res.json(insm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearInsumo = async (req, res) => {
    try {
        const { id_categoria , id_unidad, nombre_insumo } = req.body; 

        if (!id_categoria || !id_unidad || !nombre_insumo ) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await insumos.create(req.body);

        res.status(201).json({ 
            message: "Insumo creado correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarInsumo = async (req, res) => {
    try {
        const actualizado = await insumos.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Insumo no encontrado" });
        }
        res.json({ message: "Insumo actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarInsumo = async (req, res) => {
    try {
        const eliminado = await insumos.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Insumo no encontrado" 
            });
        res.json({ message: "Insumo eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarInsumo,
    obtenerInsumo,
    crearInsumo,
    actualizarInsumo,
    eliminarInsumo
}

