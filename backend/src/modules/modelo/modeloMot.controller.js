import modeloModel from './modeloMot.js';

const REGEX_NOMBRE_MODELO = /^[A-ZÁÉÍÓÚÑ]+[A-Z0-9ÁÉÍÓÚÑ\s-]*$/;

const sanitizarYMayusculas = (texto) => {
    if (!texto || typeof texto !== 'string') return '';
    return texto.trim().toUpperCase().replace(/\s+/g, ' ');
};

// Código estándar de MySQL/MariaDB cuando salta una restricción UNIQUE.
// Sirve como red de seguridad ante condiciones de carrera (dos registros casi simultáneos).
const esErrorDeDuplicado = (error) => error?.code === 'ER_DUP_ENTRY';

export const getModelos = async (req, res) => {
    try {
        const data = await modeloModel.findAll();
        return res.status(200).json({ status: 'success', data });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: "Error al obtener los modelos.", error: error.message });
    }
};

export const obtenerModelo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ status: 'error', message: "ID no válido." });
        }

        const modelo = await modeloModel.findById(id);
        if (!modelo) {
            return res.status(404).json({ status: 'error', message: "Modelo no encontrado." });
        }

        return res.status(200).json({ status: 'success', data: modelo });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: "Error al consultar el modelo.", error: error.message });
    }
};

export const createModelo = async (req, res) => {
    try {
        const nombre = req.body.nombre || req.body.nombre_modelo;
        const nombreFormateado = sanitizarYMayusculas(nombre);

        if (!nombreFormateado) {
            return res.status(400).json({ status: 'error', message: "El nombre del modelo es obligatorio." });
        }
        if (!REGEX_NOMBRE_MODELO.test(nombreFormateado)) {
            return res.status(400).json({ status: 'error', message: "El nombre debe iniciar con letras (ej. DUKE 200)." });
        }
        if (nombreFormateado.length < 2 || nombreFormateado.length > 50) {
            return res.status(400).json({ status: 'error', message: "El nombre debe tener entre 2 y 50 caracteres." });
        }

        const existente = await modeloModel.findByNombre(nombreFormateado);
        if (existente) {
            return res.status(409).json({ status: 'error', message: `El modelo "${nombreFormateado}" ya existe.` });
        }

        const id_modelo = await modeloModel.create(nombreFormateado);
        return res.status(201).json({
            status: 'success',
            message: "Modelo registrado correctamente.",
            data: { id_modelo, nombre: nombreFormateado }
        });
    } catch (error) {
        if (esErrorDeDuplicado(error)) {
            return res.status(409).json({ status: 'error', message: "Ese modelo ya existe (duplicado detectado por la base de datos)." });
        }
        return res.status(500).json({ status: 'error', message: "Error al registrar el modelo.", error: error.message });
    }
};

export const updateModelo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ status: 'error', message: "El ID del modelo no es válido." });
        }

        const modeloActual = await modeloModel.findById(id);
        if (!modeloActual) {
            return res.status(404).json({ status: 'error', message: "El modelo no existe." });
        }

        const nombreFormateado = nombre ? sanitizarYMayusculas(nombre) : modeloActual.nombre;

        if (!REGEX_NOMBRE_MODELO.test(nombreFormateado)) {
            return res.status(400).json({
                status: 'error',
                message: "El nombre del modelo debe iniciar con letras (ej. DUKE 200)."
            });
        }

        if (nombreFormateado.length < 2 || nombreFormateado.length > 50) {
            return res.status(400).json({ status: 'error', message: "El nombre debe tener entre 2 y 50 caracteres." });
        }

        const duplicado = await modeloModel.findByNombreExcluyendoId(nombreFormateado, id);
        if (duplicado) {
            return res.status(409).json({
                status: 'error',
                message: `Ya existe un modelo denominado "${nombreFormateado}".`
            });
        }

        await modeloModel.update(id, nombreFormateado);

        return res.status(200).json({ status: 'success', message: "Modelo actualizado correctamente." });

    } catch (error) {
        if (esErrorDeDuplicado(error)) {
            return res.status(409).json({ status: 'error', message: "Ese nombre de modelo ya existe (duplicado detectado por la base de datos)." });
        }
        return res.status(500).json({ status: 'error', message: "Error al actualizar el modelo.", error: error.message });
    }
};

export const deleteModelo = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ status: 'error', message: "El ID proporcionado no es válido." });
        }

        const totalMotos = await modeloModel.countMotosAsociadas(id);
        if (totalMotos > 0) {
            return res.status(400).json({
                status: 'error',
                message: `No se puede eliminar el modelo. Está asociado a ${totalMotos} motocicleta(s).`
            });
        }

        const eliminado = await modeloModel.delete(id);
        if (!eliminado) {
            return res.status(404).json({ status: 'error', message: "El modelo no existe." });
        }

        return res.status(200).json({ status: 'success', message: "Modelo eliminado correctamente." });

    } catch (error) {
        return res.status(500).json({ status: 'error', message: "Error al eliminar el modelo.", error: error.message });
    }
};

export default {
    getModelos,
    obtenerModelo,
    createModelo,
    updateModelo,
    deleteModelo
};