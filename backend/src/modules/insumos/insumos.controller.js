import insumo from './insumos.model.js';

export const listarInsumos = async (req, res) => {
    try {
        const insumos = await insumo.findAll();
        res.json(insumos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar insumos' });
    }
};

export const obtenerInsumo = async (req, res) => {
    try {
        const ins = await insumo.findById(req.params.id);
        if (!ins) return res.status(404).json({ message: "Insumo no encontrado" });
        res.json(ins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearInsumo = async (req, res) => {
    try {
        const { nombre_insumo, id_categoria, id_unidad } = req.body;
        if (!nombre_insumo || !id_categoria || !id_unidad) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }
        await insumo.create(req.body);
        res.status(201).json({ message: "Insumo creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarInsumo = async (req, res) => {
    try {
        const actualizado = await insumo.update(req.params.id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Insumo no encontrado" });
        res.json({ message: "Insumo actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarInsumo = async (req, res) => {
    try {
        const eliminado = await insumo.delete(req.params.id);
        if (!eliminado) return res.status(404).json({ message: "Insumo no encontrado" });
        res.json({ message: "Insumo eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarInsumos,
    obtenerInsumo,
    crearInsumo,
    actualizarInsumo,
    eliminarInsumo
};