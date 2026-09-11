import categoriaInsumo from './categoriaProd.model.js';

const REGEX_NOMBRE_CATEGORIA = /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9\s-]*$/;
const NOMBRE_MAX_LENGTH = 20; // Debe coincidir con el varchar(20) de la tabla categoria
const DESCRIPCION_MAX_LENGTH = 255;

const sanitizarNombre = (texto) => {
    if (!texto || typeof texto !== 'string') return '';
    return texto.trim().toUpperCase().replace(/\s+/g, ' ');
};

const sanitizarDescripcion = (texto) => {
    if (texto === undefined || texto === null) return null;
    if (typeof texto !== 'string') return null;
    const limpio = texto.trim().replace(/\s+/g, ' ');
    return limpio || null;
};

// Código estándar de MySQL/MariaDB cuando salta una restricción UNIQUE.
// Sirve como red de seguridad ante condiciones de carrera.
const esErrorDeDuplicado = (error) => error?.code === 'ER_DUP_ENTRY';

const validarNombre = (nombreFormateado) => {
    if (!nombreFormateado) {
        return "El nombre de la categoría es obligatorio.";
    }
    if (nombreFormateado.length > NOMBRE_MAX_LENGTH) {
        return `El nombre no puede superar los ${NOMBRE_MAX_LENGTH} caracteres.`;
    }
    if (nombreFormateado.length < 2) {
        return "El nombre debe tener al menos 2 caracteres.";
    }
    if (!REGEX_NOMBRE_CATEGORIA.test(nombreFormateado)) {
        return "El nombre debe iniciar con una letra y solo puede contener letras, números, espacios o guiones.";
    }
    return null;
};

export const listarCatInsumo = async (req, res) => {
    try {
        const data = await categoriaInsumo.findAll();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al listar categorías de insumos.' });
    }
};

export const obtenerCatgInsm = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ status: 'error', message: 'ID no válido.' });
        }

        const catgInsumo = await categoriaInsumo.findById(id);
        if (!catgInsumo) {
            return res.status(404).json({ status: 'error', message: "Categoría de insumo no encontrada." });
        }

        res.status(200).json({ status: 'success', data: catgInsumo });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const crearCatgInsm = async (req, res) => {
    try {
        const nombreFormateado = sanitizarNombre(req.body.nombre);
        const descripcionFormateada = sanitizarDescripcion(req.body.Descripcion);

        const errorNombre = validarNombre(nombreFormateado);
        if (errorNombre) {
            return res.status(400).json({ status: 'error', message: errorNombre });
        }

        if (descripcionFormateada && descripcionFormateada.length > DESCRIPCION_MAX_LENGTH) {
            return res.status(400).json({
                status: 'error',
                message: `La descripción no puede superar los ${DESCRIPCION_MAX_LENGTH} caracteres.`
            });
        }

        const existente = await categoriaInsumo.findByNombre(nombreFormateado);
        if (existente) {
            return res.status(409).json({
                status: 'error',
                message: "El nombre de la categoría ya existe. Debes ingresar otro"
            });
        }

        const id_categoria = await categoriaInsumo.create({
            nombre: nombreFormateado,
            Descripcion: descripcionFormateada,
            estado: 1
        });

        res.status(201).json({
            status: 'success',
            message: "Categoría de insumo creada correctamente.",
            data: { id_categoria, nombre: nombreFormateado, Descripcion: descripcionFormateada, estado: 1 }
        });
    } catch (error) {
        if (esErrorDeDuplicado(error)) {
            return res.status(409).json({
                status: 'error',
                message: "El nombre de la categoría ya existe. Debes ingresar otro"
            });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const actualizarCatInsumo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ status: 'error', message: 'ID no válido.' });
        }

        const categoriaActual = await categoriaInsumo.findById(id);
        if (!categoriaActual) {
            return res.status(404).json({ status: 'error', message: "Registro categoría insumo no encontrado." });
        }

        const nombreFormateado = req.body.nombre ? sanitizarNombre(req.body.nombre) : categoriaActual.nombre;
        const descripcionFormateada = req.body.Descripcion !== undefined
            ? sanitizarDescripcion(req.body.Descripcion)
            : categoriaActual.Descripcion;

        const errorNombre = validarNombre(nombreFormateado);
        if (errorNombre) {
            return res.status(400).json({ status: 'error', message: errorNombre });
        }

        if (descripcionFormateada && descripcionFormateada.length > DESCRIPCION_MAX_LENGTH) {
            return res.status(400).json({
                status: 'error',
                message: `La descripción no puede superar los ${DESCRIPCION_MAX_LENGTH} caracteres.`
            });
        }

        const duplicado = await categoriaInsumo.findByNombreExcluyendoId(nombreFormateado, id);
        if (duplicado) {
            return res.status(409).json({
                status: 'error',
                message: "El nombre de la categoría ya existe. Debes ingresar otro"
            });
        }

        await categoriaInsumo.update(id, { nombre: nombreFormateado, Descripcion: descripcionFormateada });

        res.status(200).json({ status: 'success', message: "Registro categoría insumo actualizado correctamente." });
    } catch (error) {
        if (esErrorDeDuplicado(error)) {
            return res.status(409).json({
                status: 'error',
                message: "El nombre de la categoría ya existe. Debes ingresar otro"
            });
        }
        console.error("ERROR EN EL MODELO:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Reemplaza a eliminarCatgInsm: desactiva/activa en vez de borrar físicamente,
// y bloquea la desactivación si la categoría tiene insumos asociados.
export const cambiarEstadoCatInsumo = async (req, res) => {
    try {
        const { id } = req.params;
        const estado = Number(req.body.estado);

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ status: 'error', message: 'ID no válido.' });
        }
        if (estado !== 0 && estado !== 1) {
            return res.status(400).json({ status: 'error', message: 'Estado no válido. Debe ser 0 (inactiva) o 1 (activa).' });
        }

        const categoriaActual = await categoriaInsumo.findById(id);
        if (!categoriaActual) {
            return res.status(404).json({ status: 'error', message: "Registro categoría insumo no encontrado." });
        }

        if (estado === 0) {
            const totalInsumos = await categoriaInsumo.countInsumosAsociados(id);
            if (totalInsumos > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: `No se puede desactivar la categoría. Está asociada a ${totalInsumos} insumo(s).`
                });
            }
        }

        await categoriaInsumo.cambiarEstado(id, estado);

        res.status(200).json({
            status: 'success',
            message: estado === 1
                ? "Categoría de insumo activada correctamente."
                : "Categoría de insumo desactivada correctamente."
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export default {
    listarCatInsumo,
    obtenerCatgInsm,
    crearCatgInsm,
    actualizarCatInsumo,
    cambiarEstadoCatInsumo
};