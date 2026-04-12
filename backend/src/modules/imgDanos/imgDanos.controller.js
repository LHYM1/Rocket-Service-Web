import imgDanosModel from './imgDanos.model.js';

export const listarImgDanos = async (req, res) => {
    try {
        const imgDanos = await imgDanosModel.findAll();
        console.log("Datos obtenidos:", imgDanos);
        res.json(imgDanos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const ObtenerImgDanos = async (req, res) => {
    try {
       const imgDanos = await imgDanosModel.findById(req.params.id);
       if (!imgDanos) return res.status(404).json({ message: "Imagen daño no encontrada"})
       res.json(imgDanos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
}

export const crearImgDanos = async (req, res) => {
    console.log("Datos recibidos en el server", req.body);
    try {

        const {
            id_orden, 
            descripcion, 
            url_imagen
        } = req.body;
        
        if (!id_orden || !descripcion) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        const id = await imgDanosModel.create(req.body);

        res.status(201).json({ 
            message: "Imagen de daño creada exitosamente",
        }); 

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const actImgDanos = async (req, res) => {
    try {
        const actualizado = await imgDanosModel.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Imagen daño no encontrada" });
        }
        res.json({ message: "Imagen daño actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const eliminarImgDano = async (req, res) => {
    try {
        const eliminado = await imgDanosModel.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Imagen daño no encontrada" 
            });
        res.json({ message: "Imagen daño eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Exportación por defecto para que el import en las rutas funcione correctamente
export default {
    listarImgDanos,
    ObtenerImgDanos,
    crearImgDanos,
    actImgDanos,
    eliminarImgDano
};