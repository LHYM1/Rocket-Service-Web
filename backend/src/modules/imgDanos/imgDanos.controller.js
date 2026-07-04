import imgDanosModel from './imgDanos.model.js';
import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';

export const listarImgDanos = async (req, res) => {
    try {
        const imgs = await imgDanosModel.findAll();
        res.json(imgs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarPorOrden = async (req, res) => {
    try {
        const imgs = await imgDanosModel.findByOrden(req.params.idOrden);
        res.json(imgs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarOrdenesTecnico = async (req, res) => {
    try {
        const idTecnico = req.user.id;
        const ordenes = await imgDanosModel.findOrdenesTecnico(idTecnico);
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const subirImagen = async (req, res) => {
    try {
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);

        if (!req.file) {
            return res.status(400).json({ message: "No se recibió ninguna imagen" });
        }

        const { id_orden, descripcion } = req.body;

        if (!id_orden) {
            return res.status(400).json({ message: "id_orden es requerido" });
        }

        console.log("Subiendo a Cloudinary...");
        const resultado = await cloudinary.uploader.upload(req.file.path, {
            folder: `rocket_service/orden_${id_orden}`,
            resource_type: 'image'
        });
        console.log("Resultado Cloudinary:", resultado.secure_url);

        fs.unlinkSync(req.file.path);

        const id = await imgDanosModel.create({
            id_orden,
            descripcion: descripcion || "",
            url_imagen: resultado.secure_url
        });

        res.status(201).json({
            message: "Imagen subida correctamente",
            id_imagen: id,
            url_imagen: resultado.secure_url
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error subirImagen:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarImagen = async (req, res) => {
    try {
        const eliminado = await imgDanosModel.delete(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }
        res.json({ message: "Imagen eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const validarImagenes = async (req, res) => {
    try {
        const total = await imgDanosModel.countByOrden(req.params.idOrden);
        res.json({ tiene_imagenes: total > 0, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarImgDanos,
    listarPorOrden,
    listarOrdenesTecnico,
    subirImagen,
    eliminarImagen,
    validarImagenes
};