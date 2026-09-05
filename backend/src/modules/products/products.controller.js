import insumos from './products.model.js';

export const listarInsumo = async (req, res) => {

    try {
        const insm = await insumos.findAll();
        res.json(insm);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al listar Insumos' });
    }
};

export const obtenerInsumo = async (req, res) => {
    try {
        const insm = await insumos.findById(req.params.id);
        if (!insm) return res.status(404).json({ message: "Insumo no encontrado" });
        res.json(insm);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HU-004.1 -- Registrar insumo
export const crearInsumo = async (req, res) => {
    try {
        const { id_categoria, id_unidad, nombre_insumo, cantidad_disponible, precio_unitario } = req.body;

        // CA-004: campos obligatorios vacíos
        if (
            !id_categoria ||
            !id_unidad ||
            !nombre_insumo ||
            cantidad_disponible === undefined ||
            cantidad_disponible === null ||
            cantidad_disponible === "" ||
            precio_unitario === undefined ||
            precio_unitario === null ||
            precio_unitario === ""
        ) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        // RN-003 / CA-003: cantidad inicial debe ser un entero mayor a cero
        const cantidad = Number(cantidad_disponible);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                message: "La cantidad inicial del insumo debe ser mayor a cero."
            });
        }

        // RN-005 / CA-007: precio unitario mínimo $1.000
        const precio = Number(precio_unitario);
        if (Number.isNaN(precio) || precio < 1000) {
            return res.status(400).json({
                message: "El precio unitario debe ser de al menos $1.000."
            });
        }

        // RN-002 / CA-005: la categoría debe existir y estar activa
        const categoria = await insumos.getCategoriaPorId(id_categoria);
        if (!categoria) {
            return res.status(400).json({
                message: "La categoría seleccionada no existe."
            });
        }
        if (categoria.estado !== 1) {
            return res.status(400).json({
                message: "La categoría seleccionada está inactiva."
            });
        }

        // RN-001 / CA-002: el nombre del insumo debe ser único
        const existente = await insumos.findByNombre(nombre_insumo);
        if (existente) {
            return res.status(409).json({
                message: "El nombre del insumo ya existe."
            });
        }

        await insumos.create({
            id_categoria,
            id_unidad,
            nombre_insumo,
            cantidad_disponible: cantidad,
            precio_unitario: precio
        });

        res.status(201).json({
            message: "Insumo creado correctamente"
        });
    } catch (error) {
        // Respaldo por si una condición de carrera deja pasar un duplicado hasta la BD
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El nombre del insumo ya existe." });
        }
        res.status(500).json({ error: error.message });
    }
};

// HU-004.3 -- Actualizar insumo
export const actualizarInsumo = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_categoria, nombre_insumo, cantidad_a_agregar } = req.body;

        const insumoActual = await insumos.findById(id);
        if (!insumoActual) {
            return res.status(404).json({ message: "Insumo no encontrado" });
        }

        // RN-004 / CA-004: la categoría debe existir y estar activa
        if (!id_categoria) {
            return res.status(400).json({ message: "La categoría es obligatoria." });
        }
        const categoria = await insumos.getCategoriaPorId(id_categoria);
        if (!categoria) {
            return res.status(400).json({ message: "La categoría seleccionada no existe." });
        }
        if (categoria.estado !== 1) {
            return res.status(400).json({ message: "La categoría seleccionada está inactiva." });
        }

        // RN-003 / CA-003: el nombre actualizado debe seguir siendo único (si se cambió)
        const nombreFinal = nombre_insumo || insumoActual.nombre_insumo;
        if (nombreFinal !== insumoActual.nombre_insumo) {
            const existente = await insumos.findByNombreExcluyendo(nombreFinal, id);
            if (existente) {
                return res.status(409).json({ message: "El nombre del insumo ya existe." });
            }
        }

        // Cantidad a agregar: entero mayor a cero si se ingresa (Datos requeridos)
        if (cantidad_a_agregar !== undefined && cantidad_a_agregar !== null && cantidad_a_agregar !== "") {
            const cantidad = Number(cantidad_a_agregar);
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                return res.status(400).json({
                    message: "La cantidad a agregar debe ser un número entero mayor a cero."
                });
            }
        }

        const actualizado = await insumos.update(id, {
            id_categoria,
            nombre_insumo: nombreFinal,
            cantidad_a_agregar
        });

        if (!actualizado) {
            return res.status(404).json({ message: "Insumo no encontrado" });
        }
        res.json({ message: "Insumo actualizado correctamente" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El nombre del insumo ya existe." });
        }
        res.status(500).json({ error: error.message });
    }
};

export const eliminarInsumo = async (req, res) => {
    try {
        const eliminado = await insumos.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Insumo no encontrado" 
            });
        res.json({ message: "Insumo eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarInsumo,
    obtenerInsumo,
    crearInsumo,
    actualizarInsumo,
    eliminarInsumo
}