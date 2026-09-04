import motocicleta from './model.motocicleta.js';


const formatearNombre = (str) => {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
};


export const restriccionMoto = async (req, res) => {
    try {

        // Quedé acá.
        const { id } = req.params;
        const { placa, nombre, kilometraje_actual } = req.body;
        const nombreFormateado = formatearNombre(nombre_servicio);

        if (!nombreFormateado) {
            return res.status(400).json({ message: "El nombre del tipo de servicio es obligatorio." });
        }

        const existeServicio = await typeServices.findById(id);
        if (!existeServicio) {
            return res.status(404).json({ message: "Tipo de servicio no encontrado" });
        }

        const duplicado = await typeServices.findByNombre(nombreFormateado, id);
        if (duplicado) {
            return res.status(400).json({ message: "Ya existe otro tipo de servicio con este nombre." });
        }

        await typeServices.update(id, {
            nombre_servicio: nombreFormateado,
            descripcion_servicio
        });

        res.json({ message: "Tipo de servicio actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar tipo de servicio", error: error.message });
    }
};



export const listarMotocicleta = async (req, res) => {
    try {
        const motos = await motocicleta.findAll();
        res.json(motos);
    } catch (error) {
        console.error("Error al listar motocicletas:", error);
        res.status(500).json({ error: 'Error interno al listar motocicletas' });
    }
};

export const obtenerMoto = async (req, res) => {
    try {
        const moto = await motocicleta.findById(req.params.id);
        if (!moto) return res.status(404).json({ message: "Motocicleta no encontrada" });
        res.json(moto);
    } catch (error) {
        console.error("Error al obtener la motocicleta:", error);
        res.status(500).json({ error: 'Error interno al obtener motocicleta' });
    }
};

export const crearMoto = async (req, res) => {
    try {
        const { placa, id_modelo, kilometraje_actual, id_usuario } = req.body;

        if (!placa || !id_modelo || kilometraje_actual === undefined || !id_usuario) {
            return res.status(400).json({ message: "Todos los campos obligatorios deben ser diligenciados" });
        }

        const existePlaca = await motocicleta.findByPlaca(placa);
        if (existePlaca) {
            return res.status(400).json({ message: "La placa ya se encuentra registrada en el sistema" });
        }

        const id = await motocicleta.create({ placa, id_modelo, kilometraje_actual, id_usuario });

        res.status(201).json({ 
            message: "Registro de motocicleta creado correctamente",
            id_moto: id
        }); 
    } catch (error) {
        console.error("Error al crear motocicleta:", error);
        res.status(500).json({ error: 'Error interno al registrar motocicleta' });
    }
};

export const actualizarMot = async (req, res) => {
    try {
        const { placa, id_modelo, kilometraje_actual, id_usuario } = req.body;

        if (!placa || !id_modelo || kilometraje_actual === undefined || !id_usuario) {
            return res.status(400).json({ message: "Todos los campos obligatorios deben ser diligenciados" });
        }

        const existePlaca = await motocicleta.findByPlaca(placa);
        if (existePlaca && existePlaca.id_moto !== parseInt(req.params.id, 10)) {
            return res.status(400).json({ message: "La placa ya está asignada a otra motocicleta" });
        }

        const actualizado = await motocicleta.update(req.params.id, { placa, id_modelo, kilometraje_actual, id_usuario });

        if (!actualizado) {
            return res.status(404).json({ message: "Registro de motocicleta no encontrado" });
        }
        
        res.json({ message: "Registro de motocicleta actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar motocicleta:", error);
        res.status(500).json({ error: 'Error interno al actualizar motocicleta' });
    }
};

export const eliminarMoto = async (req, res) => {
    try {
        const eliminado = await motocicleta.delete(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: "Registro de motocicleta no encontrado" });
        }
        res.json({ message: "Registro de motocicleta eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar motocicleta:", error);
        res.status(500).json({ error: 'Error al eliminar motocicleta' });
    }
};

export default {
    listarMotocicleta,
    obtenerMoto,   
    crearMoto,
    actualizarMot,
    eliminarMoto
};