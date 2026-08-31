import insumos from './products.model.js';

// Listar todos los insumos
export const listarInsumo = async (req, res) => {
    try {
        const insm = await insumos.findAll();
        res.json(insm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar Insumos' });
    }
};

// Obtener insumo por id
export const obtenerInsumo = async (req, res) => {
    try {
        const insm = await insumos.findById(req.params.id);
        if (!insm) return res.status(404).json({ message: "Insumo no encontrado" });
        res.json(insm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear insumo
export const crearInsumo = async (req, res) => {
    try {
        const { id_categoria, id_unidad, nombre_insumo, cantidad_disponible, precio_unitario } = req.body;

        // Validar campos obligatorios
        if (!id_categoria || !id_unidad || !nombre_insumo || !cantidad_disponible || !precio_unitario) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        // Validar cantidad inicial mayor a cero
        if (parseInt(cantidad_disponible) <= 0) {
            return res.status(400).json({ 
                message: "La cantidad inicial del insumo debe ser mayor a cero." 
            });
        }

        // Validar precio mínimo $1.000
        if (parseInt(precio_unitario) < 1000) {
            return res.status(400).json({ 
                message: "El precio unitario debe ser mínimo $1.000." 
            });
        }

        // Validar nombre único
        const existe = await insumos.findByNombre(nombre_insumo);
        if (existe) {
            return res.status(400).json({ 
                message: "Ya existe un insumo con ese nombre." 
            });
        }

        await insumos.create(req.body);

        res.status(201).json({ 
            message: "Insumo registrado correctamente." 
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar insumo
export const actualizarInsumo = async (req, res) => {
    try {
        const { nombre_insumo, precio_unitario, cantidad_adicional } = req.body;
        const id = req.params.id;

        // Validar precio mínimo si viene
        if (precio_unitario && parseInt(precio_unitario) < 1000) {
            return res.status(400).json({ 
                message: "El precio unitario debe ser mínimo $1.000." 
            });
        }

        // Validar cantidad adicional mayor a cero si viene
        if (cantidad_adicional !== undefined && cantidad_adicional !== "" && parseInt(cantidad_adicional) <= 0) {
            return res.status(400).json({ 
                message: "La cantidad a agregar debe ser mayor a cero." 
            });
        }

        // Validar nombre único excluyendo el insumo actual
        if (nombre_insumo) {
            const existe = await insumos.findByNombre(nombre_insumo, id);
            if (existe) {
                return res.status(400).json({ 
                    message: "Ya existe un insumo con ese nombre." 
                });
            }
        }

        const actualizado = await insumos.update(id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Insumo no encontrado" });
        }

        res.json({ message: "Insumo actualizado correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Desactivar insumo (softDelete)
export const desactivarInsumo = async (req, res) => {
    try {
        const desactivado = await insumos.softDelete(req.params.id);
        if (!desactivado) 
            return res.status(404).json({ message: "Insumo no encontrado" });
        res.json({ message: "Insumo desactivado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reactivar insumo
export const reactivarInsumo = async (req, res) => {
    try {
        const reactivado = await insumos.reactivar(req.params.id);
        if (!reactivado)
            return res.status(404).json({ message: "Insumo no encontrado" });
        res.json({ message: "Insumo reactivado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarInsumo,
    obtenerInsumo,
    crearInsumo,
    actualizarInsumo,
    desactivarInsumo,
    reactivarInsumo
};