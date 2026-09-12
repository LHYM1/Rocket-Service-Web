import insumosUsados from './prodtsUseService.model.js';

export const listarInsumosUsados = async (req, res) => {
    try {
        const data = await insumosUsados.findAll();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('Error al listar insumos usados en servicio:', error);
        res.status(500).json({ status: 'error', message: 'Error al listar los insumos usados en servicio.' });
    }
};

export default { listarInsumosUsados };