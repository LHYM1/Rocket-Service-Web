
import registroActv from './regtActv.models.js';

export const obtenerDisponibilidad = async (req, res) => {
    try {
        const disponibilidad = await registroActv.findDisponibilidadByTecnico(req.params.idUsuario);
        if (!disponibilidad) return res.status(404).json({ message: "No encontrado" });
        res.json(disponibilidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarDisponibilidad = async (req, res) => {
    try {
        const { estado_disponibilidad } = req.body;
        const actualizado = await registroActv.updateDisponibilidad(req.params.idUsuario, estado_disponibilidad);
        if (!actualizado) return res.status(404).json({ message: "Registro no encontrado" });
        res.json({ message: "Disponibilidad actualizada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listarRegAct = async (req, res) => {

    try {
        const regAct = await registroActv.findAll();
        res.json(regAct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar registros de actividad' });
    }
};

export const obtenerRegAct = async (req, res) => {
    try {
        const regAct = await registroActv.findById(req.params.id);
        if (!regAct) return res.status(404).json({ message: "Registro de actividad no encontrado" });
        res.json(regAct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearRegAct = async (req, res) => {
    try {
        const { codigo_registro , id_orden  , id_usuario , estado_disponibilidad } = req.body; // Campos que se envian desde el frontend

        if (!codigo_registro || !id_orden || !id_usuario || !estado_disponibilidad) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await registroActv.create(req.body);

        res.status(201).json({ 
            message: "Registro de actividad creado correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarRegAct = async (req, res) => {
    try {
        const actualizado = await registroActv.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Registro de actividad no encontrado" });
        }
        res.json({ message: "Registro de actividad actualizado correctamente" });
    } catch (error) {
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarRegAct = async (req, res) => {
    try {
        const eliminado = await registroActv.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Registro de actividad no encontrado" 
            });
        res.json({ message: "Registro actividad eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarRegAct,
    obtenerRegAct,   
    crearRegAct,
    actualizarRegAct,
    eliminarRegAct,
    actualizarDisponibilidad,
    obtenerDisponibilidad
};


