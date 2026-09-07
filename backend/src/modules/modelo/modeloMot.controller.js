import modeloMot from './modeloMot.model.js';

export const listarModeloMot = async (req, res) => {
    try {
        const modelo = await modeloMot.findAll();
        res.json(modelo);
    } catch (error) {
        console.error(error);
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
        const { nombre } = req.body;

        // RN-003: campo obligatorio
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ message: "El nombre del modelo es obligatorio." });
        }

        // RN-002: nombre único
        const existe = await modeloMot.findByNombre(nombre);
        if (existe) {
            return res.status(400).json({ message: "Este nombre de modelo ya existe. Por favor ingrese otro." });
        }

        await modeloMot.create(req.body);

        res.status(201).json({ message: "Modelo de motocicleta registrado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const actualizarModeloMot = async (req, res) => {
    try {
        const { nombre } = req.body;
        const id = req.params.id;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ message: "No puede dejar este campo sin completar." });
        }

        const modeloActual = await modeloMot.findById(id);
        if (!modeloActual) {
            return res.status(404).json({ message: "El modelo no existe." });
        }

        // RN-002: nombre único (excluyendo el propio registro)
        const existe = await modeloMot.findByNombre(nombre, id);
        if (existe) {
            return res.status(400).json({ message: "Este nombre ya está en uso." });
        }

        await modeloMot.update(id, req.body);

        res.json({ message: "Modelo de motocicleta actualizado satisfactoriamente." });
    } catch (error) {
        console.error("ERROR ACTUALIZAR MODELO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// RN-003/RN-004: softdelete, bloqueado si está en uso
export const desactivarModelo = async (req, res) => {
    try {
        const id = req.params.id;

        const modeloActual = await modeloMot.findById(id);
        if (!modeloActual) {
            return res.status(404).json({ message: "El modelo no existe." });
        }
        if (modeloActual.estado === 0) {
            return res.status(409).json({ message: "Este modelo ya se encuentra inactivo." });
        }

        const totalMotos = await modeloMot.contarMotosAsociadas(id);
        if (totalMotos > 0) {
            return res.status(409).json({
                message: `No es posible desactivar este modelo: está asociado a ${totalMotos} motocicleta(s).`
            });
        }

        await modeloMot.softDelete(id);
        res.json({ message: "Modelo de motocicleta desactivado satisfactoriamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reactivarModelo = async (req, res) => {
    try {
        const reactivado = await modeloMot.reactivar(req.params.id);
        if (!reactivado) {
            return res.status(404).json({ message: "Modelo no encontrado" });
        }
        res.json({ message: "Modelo reactivado correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    listarModeloMot,
    obtenerModelo,
    crearModelo,
    actualizarModeloMot,
    desactivarModelo,
    reactivarModelo
};