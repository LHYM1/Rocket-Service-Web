
import categoriaInsumo from './categoriaProd.model.js';

export const listarCatInsumo = async (req, res) => {

    try {
        const catgInsumo = await categoriaInsumo.findAll();
        res.json(catgInsumo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar categorias de insumos' });
    }
};

export const obtenerCatgInsm = async (req, res) => {
    try {
        const catgInsumo = await categoriaInsumo.findById(req.params.id);
        if (!catgInsumo) return res.status(404).json({ message: "Categoria de insumo no encontrada" });
        res.json(catgInsumo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearCatgInsm = async (req, res) => {
    try {
        const { nombre } = req.body; 

        if (!nombre) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await categoriaInsumo.create(req.body);

        res.status(201).json({ 
            message: "Categoria de insumo creada correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarCatInsumo = async (req, res) => {
    try {
        const actualizado = await categoriaInsumo.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Registro categoria insumo no encontrado" });
        }
        res.json({ message: "Registro categoria insumo actualizado correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarCatgInsm = async (req, res) => {
    try {
        const eliminado = await categoriaInsumo.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Registro de categoria insumo no encontrado" 
            });
        res.json({ message: "Registro categoria insumo eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarCatInsumo,
    obtenerCatgInsm,   
    crearCatgInsm,
    actualizarCatInsumo,
    eliminarCatgInsm
};


