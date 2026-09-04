import unidadMedida from './undMed.model.js';

export const listarUnidadMedida = async (req, res) => {
    try {
        const undMed = await unidadMedida.findAll();
        res.json(undMed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar unidad de medida' });
    }
};

export const obtenerUnidadMed = async (req, res) => {
    try {
        const undMed = await unidadMedida.findById(req.params.id);
        if (!undMed) return res.status(404).json({ message: "Unidad de medida no encontrada" });
        res.json(undMed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearUnidadMed = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio." });
        }

        const existe = await unidadMedida.findByNombre(nombre);
        if (existe) {
            return res.status(400).json({ message: "Ya existe una unidad de medida con ese nombre." });
        }

        const id_unidad = await unidadMedida.create(req.body);

        res.status(201).json({
            message: "Unidad de medida creada correctamente.",
            id_unidad,
            nombre: nombre.trim()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const actualizarUnidadMed = async (req, res) => {
    try {
        const { nombre } = req.body;
        const id = req.params.id;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio." });
        }

        const existe = await unidadMedida.findByNombre(nombre, id);
        if (existe) {
            return res.status(400).json({ message: "Ya existe una unidad de medida con ese nombre." });
        }

        const actualizado = await unidadMedida.update(id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Unidad de medida no encontrada" });
        }
        res.json({ message: "Unidad de medida actualizada correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarUnidMed = async (req, res) => {
    try {
        const id = req.params.id;

        // Regla de negocio: no se puede eliminar una unidad de medida 
        // que esté asociada a uno o más insumos.
        const totalInsumos = await unidadMedida.contarInsumosAsociados(id);
        if (totalInsumos > 0) {
            return res.status(409).json({
                message: `No es posible eliminar esta unidad de medida: está siendo utilizada por ${totalInsumos} insumo(s).`
            });
        }

        const eliminado = await unidadMedida.delete(id);
        if (!eliminado) {
            return res.status(404).json({ message: "Unidad de medida no encontrada" });
        }
        res.json({ message: "Unidad de medida eliminada correctamente" });
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