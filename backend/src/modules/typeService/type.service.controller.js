import typeServices from './type.service.model.js';

const formatearNombre = (str) => {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
};

export const listarTypeServ = async (req, res) => {
    try {
        const typeServ = await typeServices.findAll();
        res.json(typeServ);
    } catch (error) {
        res.status(500).json({ message: "Error al listar los tipos de servicio", error: error.message });
    }
};

export const obtenerTypeServ = async (req, res) => {
    try {
        const typeServ = await typeServices.findById(req.params.id);
        if (!typeServ) return res.status(404).json({ message: "Tipo de servicio no encontrado" });
        res.json(typeServ);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el tipo de servicio", error: error.message });
    }
};

export const crearTypeServ = async (req, res) => {
    try {
        const { nombre_servicio, descripcion_servicio } = req.body;
        const nombreFormateado = formatearNombre(nombre_servicio);

        if (!nombreFormateado) {
            return res.status(400).json({ message: "El nombre del tipo de servicio es obligatorio." });
        }

        const existe = await typeServices.findByNombre(nombreFormateado);
        if (existe) {
            return res.status(400).json({ message: "Ya existe un tipo de servicio con ese nombre." });
        }

        const id = await typeServices.create({
            nombre_servicio: nombreFormateado,
            descripcion_servicio
        });

        res.status(201).json({ 
            id_tipo_servicio: id,
            message: "Tipo de servicio creado exitosamente" 
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al crear tipo de servicio", error: error.message });
    }
};

export const actTypeServ = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_servicio, descripcion_servicio } = req.body;
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

export const cambiarEstadoTypeServ = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (![0, 1].includes(Number(estado))) {
            return res.status(400).json({ message: "Estado no válido." });
        }

        const cambiado = await typeServices.changeStatus(id, Number(estado));
        if (!cambiado) return res.status(404).json({ message: "Tipo de servicio no encontrado" });

        res.json({ message: `Estado cambiado a ${Number(estado) === 1 ? 'Activo' : 'Inactivo'} correctamente` });
    } catch (error) {
        res.status(500).json({ message: "Error al cambiar el estado", error: error.message });
    }
};

export const eliminarTypeServ = async (req, res) => {
    try {
        const { id } = req.params;

        const existe = await typeServices.findById(id);
        if (!existe) {
            return res.status(404).json({ message: "Tipo de servicio no encontrado" });
        }

        const eliminado = await typeServices.delete(id);
        if (!eliminado) {
            return res.status(400).json({ message: "No se pudo eliminar el tipo de servicio" });
        }

        res.json({ message: "Tipo de servicio eliminado exitosamente" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({ 
                message: "No se puede eliminar el tipo de servicio porque está asignado a una o más órdenes de trabajo." 
            });
        }
        res.status(500).json({ message: "Error en el servidor al eliminar tipo de servicio", error: error.message });
    }
};

export default {
    listarTypeServ,
    obtenerTypeServ,
    crearTypeServ,
    actTypeServ,
    cambiarEstadoTypeServ,
    eliminarTypeServ
};