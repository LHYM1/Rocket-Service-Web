import dashboard from './dashboard.model.js';

export const obtenerResumen = async (req, res) => {
    try {
        const [porEstado, recientes, tecnicos, resenas] = await Promise.all([
            dashboard.contarOrdenesPorEstado(),
            dashboard.ordenesRecientes(8),
            dashboard.tecnicosConDisponibilidad(),
            dashboard.resumenCalificaciones()
        ]);

        const conteos = { total: 0, pendientes: 0, finalizadas: 0, canceladas: 0 };
        const PENDIENTES = ["ASIGNADA", "EN PROCESO", "PENDIENTE APROBACIÓN"];
        porEstado.forEach(fila => {
            conteos.total += fila.total;
            if (PENDIENTES.includes(fila.nombre_estado)) conteos.pendientes += fila.total;
            if (fila.nombre_estado === "FINALIZADA") conteos.finalizadas += fila.total;
            if (fila.nombre_estado === "CANCELADA") conteos.canceladas += fila.total;
        });

        res.json({
            conteos,
            ordenesRecientes: recientes,
            tecnicos,
            resenas
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { obtenerResumen };