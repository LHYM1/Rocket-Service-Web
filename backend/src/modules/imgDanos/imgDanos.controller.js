import imgDanosModel from './imgDanos.model.js';

export const listarImgDanos = async (req, res) => {
    try {
        const imgDanos = await imgDanosModel.findAll();
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

export const crearImagenDanos = async (req, res) => {
    try {
        const { id_orden, descripcion, tipo } = req.body;
        
        // Si no hay archivo, avisamos
        if (!req.file) {
            return res.status(400).json({ message: "No se seleccionó ninguna imagen" });
        }

        // Guardamos la ruta relativa a la carpeta uploads
        const nombreArchivo = req.file.filename;
        const url_imagen = `/uploads/${nombreArchivo}`;

        const nuevoRegistro = await imgDanosModel.create({
            id_orden,
            descripcion,
            url_imagen,
            tipo
        });

        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fotos de UNA orden puntual -- usado por el Técnico y por "Evidencias" del Cliente
export const obtenerPorOrden = async (req, res) => {
    try {
        const fotos = await imgDanosModel.findByOrden(req.params.id_orden);
        res.json(fotos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actImgDanos = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_orden, descripcion, tipo } = req.body;
        
        let datosActualizar = { id_orden, descripcion, tipo };

        if (req.file) {
            datosActualizar.url_imagen = `/uploads/${req.file.filename}`;
        } else {
            const actual = await imgDanosModel.findById(id);
            datosActualizar.url_imagen = actual?.url_imagen;
        }

        await imgDanosModel.update(id, datosActualizar);
        res.json({ message: "Actualizado con éxito" });
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
    crearImagenDanos,
    actImgDanos,
    eliminarImgDano,
    obtenerPorOrden
};