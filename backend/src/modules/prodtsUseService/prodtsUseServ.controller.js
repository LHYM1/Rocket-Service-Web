import ProdtUseServ from './prodtsUseServ.model.js';

export const listarInsUsedServ = async (req, res) => {
    try {
        const prdtUServ = await ProdtUseServ.findAll();
        res.json(prdtUServ);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerInsUsedServ = async (req, res) => {
    try {
        const prdtUServ = await ProdtUseServ.findById(req.params.id);
        // Corrección: evaluación correcta de prdtUServ
        if (!prdtUServ) return res.status(404).json({ message: "Insumo usado en servicio no encontrado" });
        res.json(prdtUServ);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

export const crearInsUsedServ = async (req, res) => {
    try {
        const { id_orden, id_insumo, cantidad } = req.body;
        
        if (!id_orden || !id_insumo || !cantidad) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        await ProdtUseServ.create(req.body);

        res.status(201).json({ 
            message: "Insumo usado en servicio creado exitosamente"
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actInsUsedServ = async (req, res) => {
    try {
        const actualizado = await ProdtUseServ.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Insumo usado en servicio no encontrado" });
        }
        res.json({ message: "Insumo usado en servicio actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarInsedServ = async (req, res) => {
    try {
        const eliminado = await ProdtUseServ.delete(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: "Insumo usado en servicio no encontrado" });
        }
        res.json({ message: "Insumo usado en servicio eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarInsUsedServ,
    obtenerInsUsedServ,
    crearInsUsedServ,
    actInsUsedServ,
    eliminarInsedServ
};