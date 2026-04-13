
import motocicleta from './model.motocicleta.js';

export const listarMotocicleta = async (req, res) => {

    try {
        const moto = await motocicleta.findAll();
        res.json(moto);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar motocicletas' });
    }
};

export const obtenerMoto = async (req, res) => {
    try {
        const moto = await motocicleta.findById(req.params.id);
        if (!moto) return res.status(404).json({ message: "Motocicleta no encontrada" });
        res.json(moto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearMoto = async (req, res) => {
    try {
        const { placa, id_modelo , kilometraje_actual } = req.body; // Campos que se envian desde el frontend

        if (!placa || !id_modelo || !kilometraje_actual) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await motocicleta.create(req.body);

        res.status(201).json({ 
            message: "Registo de motocicleta creado correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarMot = async (req, res) => {
    try {
        const actualizado = await motocicleta.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Registro de motocicleta no encontrado" });
        }
        res.json({ message: "Registro de motocicleta actualizado correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarMoto = async (req, res) => {
    try {
        const eliminado = await motocicleta.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Registro de motocicleta no encontrado" 
            });
        res.json({ message: "Registro de motocicleta eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarMotocicleta,
    obtenerMoto,   
    crearMoto,
    actualizarMot,
    eliminarMoto
};


