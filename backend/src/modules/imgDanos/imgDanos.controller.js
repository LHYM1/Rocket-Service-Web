import imgDanosModel from './imgDanos.model.js';
import ordenesModel from '../orders/orders.model.js';
import notificacionesModel from '../notificaciones/notificaciones.model.js';
import { subirACloudinary } from '../../config/subirACloudinary.js';

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
        const { id: id_tecnico } = req.user;

        // Si no hay archivo, avisamos
        if (!req.file) {
            return res.status(400).json({ message: "No se seleccionó ninguna imagen" });
        }

        // Con multer en memoria, el archivo llega como buffer -- se sube manualmente a Cloudinary
        const url_imagen = await subirACloudinary(req.file.buffer);

        const nuevoRegistro = await imgDanosModel.create({
            id_orden,
            descripcion,
            url_imagen,
            tipo
        });

        // Notificar al Cliente dueño de la orden (si se puede identificar la orden)
        try {
            const orden = await ordenesModel.findById(id_orden);
            if (orden?.id_usuario) {
                const tipoTexto = tipo === "Reparación" ? "una foto de reparación" : "una foto de un daño";
                await notificacionesModel.crearParaOrden({
                    id_usuario_origen: id_tecnico,
                    id_usuario_destino: orden.id_usuario,
                    mensaje: `El técnico agregó ${tipoTexto} a tu orden ${orden.codigo_orden}.`,
                    id_orden
                });
            }
        } catch (errorNotif) {
            // No bloquea la subida de la foto si la notificación falla por algún motivo
            console.error("No se pudo crear la notificación:", errorNotif.message);
        }

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
            datosActualizar.url_imagen = await subirACloudinary(req.file.buffer);
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