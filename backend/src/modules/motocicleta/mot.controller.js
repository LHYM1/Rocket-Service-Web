import motocicletas from './model.motocicleta.js';

const REGEX_PLACA_INPUT = /^[A-Z]{3}\s?[0-9]{2}[A-Z]$/;
const KM_MAXIMO_PERMITIDO = 1000000;
const MAX_INCREMENTO_SOSPECHOSO = 30000;

const sanitizarPlaca = (placa) => {
    if (!placa || typeof placa !== 'string') return null;
    const placaLimpia = placa.trim().toUpperCase();
    if (!REGEX_PLACA_INPUT.test(placaLimpia)) return null;
    
    const sinEspacios = placaLimpia.replace(/\s+/g, '');
    return `${sinEspacios.slice(0, 3)} ${sinEspacios.slice(3)}`;
};

export const getMotocicletas = async (req, res) => {
    try {
        const motos = await motocicletas.findAll();
        return res.status(200).json({ status: 'success', data: motos });
    } catch (error) {
        console.error('Error al listar motocicletas:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

export const getMotocicletaById = async (req, res) => {
    try {
        const { id } = req.params;
        const moto = await motocicletas.findById(id);

        if (!moto) {
            return res.status(404).json({ status: 'error', message: 'Motocicleta no encontrada.' });
        }

        return res.status(200).json({ status: 'success', data: moto });
    } catch (error) {
        console.error('Error al consultar motocicleta:', error);
        return res.status(500).json({ status: 'error', message: 'Error al consultar la motocicleta.' });
    }
};

export const getByPlaca = async (req, res) => {
    try {
        const { placa } = req.params;
        const placaFormateada = sanitizarPlaca(placa);

        if (!placaFormateada) {
            return res.status(400).json({ status: 'error', message: 'Formato de placa inválido.' });
        }

        const moto = await motocicletas.findByPlaca(placaFormateada);

        if (!moto) {
            return res.status(404).json({ status: 'error', message: 'No se encontró motocicleta registrada con esa placa.' });
        }

        return res.status(200).json({ status: 'success', data: moto });
    } catch (error) {
        console.error('Error al consultar motocicleta por placa:', error);
        return res.status(500).json({ status: 'error', message: 'Error al consultar la motocicleta.' });
    }
};


export const getUsuariosSinMoto = async (req, res) => {
    try {
        const usuarios = await motocicletas.findUsuariosSinMoto();
        return res.status(200).json({ status: 'success', data: usuarios });
    } catch (error) {
        console.error('Error al consultar usuarios sin motocicleta:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al consultar clientes.' });
    }
};

export const createMotocicleta = async (req, res) => {
    try {
        const { placa, id_modelo, id_usuario, kilometraje_actual } = req.body;

        const placaFormateada = sanitizarPlaca(placa);
        if (!placaFormateada) {
            return res.status(400).json({
                status: 'error',
                message: 'Formato de placa inválido. Debe contener 3 letras, 2 números y 1 letra al final (ej. COZ 89F).'
            });
        }

        const motoExistente = await motocicletas.findByPlaca(placaFormateada);
        if (motoExistente) {
            return res.status(409).json({
                status: 'error',
                message: `La motocicleta con placa ${placaFormateada} ya se encuentra registrada.`
            });
        }

        const km = Number(kilometraje_actual);
        // VALIDACIÓN: El kilometraje debe ser estricto mayor a 0
        if (isNaN(km) || km <= 0 || km > KM_MAXIMO_PERMITIDO) {
            return res.status(400).json({
                status: 'error',
                message: `El kilometraje debe ser mayor a 0 KM y máximo ${KM_MAXIMO_PERMITIDO.toLocaleString()} KM.`
            });
        }

        const newId = await motocicletas.create({
            placa: placaFormateada,
            id_modelo,
            id_usuario,
            kilometraje_actual: km,
            estado: 1
        });

        const nuevaMoto = await motocicletas.findById(newId);

        return res.status(201).json({
            status: 'success',
            message: 'Motocicleta registrada exitosamente.',
            data: nuevaMoto
        });

    } catch (error) {
        console.error('Error al registrar motocicleta:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error interno al intentar registrar la motocicleta.'
        });
    }
};

export const updateMotocicleta = async (req, res) => {
    try {
        const { id } = req.params;
        const { kilometraje_actual, id_modelo, id_usuario, estado } = req.body;

        const moto = await motocicletas.findById(id);
        if (!moto) {
            return res.status(404).json({ status: 'error', message: 'La motocicleta especificada no existe.' });
        }

        if (kilometraje_actual !== undefined && kilometraje_actual !== null) {
            const nuevoKm = Number(kilometraje_actual);
            const kmAnterior = Number(moto.kilometraje_actual);

            // VALIDACIÓN: Debe ser estrictamente mayor a 0
            if (isNaN(nuevoKm) || nuevoKm <= 0 || nuevoKm > KM_MAXIMO_PERMITIDO) {
                return res.status(400).json({ status: 'error', message: 'El kilometraje debe ser mayor a 0 KM.' });
            }

            if (nuevoKm < kmAnterior) {
                return res.status(400).json({
                    status: 'error',
                    message: `El nuevo kilometraje (${nuevoKm.toLocaleString()} KM) no puede ser inferior al último registrado (${kmAnterior.toLocaleString()} KM).`
                });
            }

            if ((nuevoKm - kmAnterior) > MAX_INCREMENTO_SOSPECHOSO) {
                return res.status(400).json({
                    status: 'error',
                    message: `El incremento de ${(nuevoKm - kmAnterior).toLocaleString()} KM parece un error de digitación.`
                });
            }
        }

        await motocicletas.update(id, { id_modelo, kilometraje_actual, id_usuario, estado });
        const motoActualizada = await motocicletas.findById(id);

        return res.status(200).json({
            status: 'success',
            message: 'Motocicleta actualizada exitosamente.',
            data: motoActualizada
        });

    } catch (error) {
        console.error('Error al actualizar motocicleta:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al actualizar.' });
    }
};

export const cambiarEstadoMotocicleta = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, kilometraje_actual } = req.body;

        const moto = await motocicletas.findById(id);
        if (!moto) {
            return res.status(404).json({ status: 'error', message: 'Motocicleta no encontrada.' });
        }

        if (estado === 0) {
            await motocicletas.desactivar(id);
        } else if (estado === 1) {
            const nuevoKm = kilometraje_actual !== undefined ? kilometraje_actual : moto.kilometraje_actual;
            await motocicletas.reactivar(id, nuevoKm);
        }

        const motoActualizada = await motocicletas.findById(id);

        return res.status(200).json({
            status: 'success',
            message: 'Estado de la motocicleta actualizado correctamente.',
            data: motoActualizada
        });
    } catch (error) {
        console.error('Error al cambiar estado de motocicleta:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

export default {
    getMotocicletas,
    getMotocicletaById,
    getByPlaca,
    getUsuariosSinMoto,
    createMotocicleta,
    updateMotocicleta,
    cambiarEstadoMotocicleta
};