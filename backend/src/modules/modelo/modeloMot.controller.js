
import modeloMot from './modeloMot.js';

export const listarModeloMot = async (req, res) => {

    try {
        const modelo = await modeloMot.findAll();
        res.json(modelo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar modelos' });
    }
};

export const obtenerModelo = async (req, res) => {
    try {
        const modelo = await modeloMot.findById(req.params.id);
        if (!modelo) return res.status(404).json({ message: "Modelo no encontrado" });
        res.json(modelo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearModelo = async (req, res) => {
    try {
        const { nombre } = req.body; // Campos DB

        if (!nombre) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await modeloMot.create(req.body);

        res.status(201).json({ 
            message: "Registo de modelo motocicleta creado correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarModeloMot = async (req, res) => {
    try {
        const actualizado = await modeloMot.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Registro de modelo no encontrado" });
        }
        res.json({ message: "Registro de modelo actualizado correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarModelo = async (req, res) => {
    try {
        const eliminado = await modeloMot.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Registro de modelo no encontrado" 
            });
        res.json({ message: "Registro de modelo eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarModeloMot,
    obtenerModelo,   
    crearModelo,
    actualizarModeloMot,
    eliminarModelo
};


