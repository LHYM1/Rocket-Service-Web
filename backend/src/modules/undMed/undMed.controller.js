
import unidadMedida from './undMed.model.js';

export const listarUnidadMedida = async (req, res) => {

    try {
        const undMed = await unidadMedida.findAll();
        res.json(undMed);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar unidad de medida' });
    }
};

export const obtenerUnidadMed = async (req, res) => {
    try {
        const undMed = await unidadMedida.findById(req.params.id);
        if (!undMed) return res.status(404).json({ message: "Unidades de medida no encontradas" });
        res.json(undMed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearUnidadMed = async (req, res) => {
    try {
        const { nombre } = req.body; // Campos DB

        if (!nombre) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await unidadMedida.create(req.body);

        res.status(201).json({ 
            message: "Registo de unidad medida creado",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarUnidadMed = async (req, res) => {
    try {
        const actualizado = await unidadMedida.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Registro de unidad de medida no encontrada" });
        }
        res.json({ message: "Registro de unidad medida actualizada correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarUnidMed = async (req, res) => {
    try {
        const eliminado = await unidadMedida.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Registro de unidad medida no encontrada" 
            });
        res.json({ message: "Registro de unidad medida eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarUnidadMedida,
    obtenerUnidadMed,   
    crearUnidadMed,
    actualizarUnidadMed,
    eliminarUnidMed
};


