const typeService = require('./type.service.model');

exports.listarTypeServ = async (req, res) => {
    try {
        const typeServ = await typeService.findAll();
        console.log("Datos obtenidos:", typeServ);
        res.json(typeServ);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.obtenerTypeServ = async (req, res) => {
    try {
       const typeServ = await typeService.findById(req.params.id);
       if (!typeServ) return res.status(404).json({ message: "Tipo de servicio no encontrado"})
       res.json(typeServ);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
}

exports.crearTypeServ = async (req, res) => {
    try {
        const {
            codigo_tipo_servicio, nombre_servicio, 
            descripcion_servicio, costo_servicio
        } = req.body;
        
        if (!codigo_tipo_servicio, !nombre_servicio,
            !descripcion_servicio, !costo_servicio) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        const id = await usersCat.create(req.body);

        res.status(201).json({ 
            message: "Tipo de servicio creado exitosamente",
        }); 

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.actTypeServ = async (req, res) => {
    try {
        const actualizado = await typeService.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Tipo de servicio no encontrado" });
        }
        res.json({ message: "Tipo de servicio actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.eliminarTypeServ = async (req, res) => {
    try {
        const eliminado = await typeService.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Categoria de usuario no encontrada" 
            });
        res.json({ message: "Categoria de usuario eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
