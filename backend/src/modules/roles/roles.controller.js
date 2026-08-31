// en la constante usuario se guarda los datos de endPoint agregar, eliminar, actualizar y listar de la tabla usuario
import usersCat from './roles.model.js';

export const listarCatUser = async (req, res) => {

    try {
        const catUsers = await usersCat.findAll();
        res.json(catUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerCatUser = async (req, res) => {
    try {
        const catUsers = await usersCat.findById(req.params.id);
        if (!catUsers) return res.status(404).json({ message: "categoria de usuario no encontrada" });
        res.json(catUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearCatUser = async (req, res) => {
    try {
        const { categoria_usuario} = req.body; // Campos que se envian desde el frontend

        if (!categoria_usuario ) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await usersCat.create(req.body);

        res.status(201).json({ 
            message: "Categoria de usuario creada exitosamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actuaCatUser = async (req, res) => {
    try {
        const actualizado = await usersCat.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Categoria de usuario no encontrada" });
        }
        res.json({ message: "Categoria actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarCatUser = async (req, res) => {
    try {
        const eliminado = await usersCat.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Categoria de usuario no encontrada" 
            });
        res.json({ message: "Categoria de usuario eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarCatUser,
    obtenerCatUser,
    crearCatUser,
    actuaCatUser,
    eliminarCatUser
}

