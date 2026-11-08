import dashboard from './dashboard.model.js';

export const obtenerResumen = async (req, res) => {
    try {
        const [porEstado, recientes, tecnicos, resenas, preRevisiones] = await Promise.all([
            dashboard.contarOrdenesPorEstado(),
            dashboard.ordenesRecientes(8),
            dashboard.tecnicosConDisponibilidad(),
            dashboard.resumenCalificaciones(),
            dashboard.contarPreRevisiones()
        ]);

        const conteos = { total: 0, pendientes: 0, finalizadas: 0, canceladas: 0 };
        const PENDIENTES = ["ASIGNADA", "EN PROCESO", "PENDIENTE APROBACIÓN"];
        porEstado.forEach(fila => {
            // PostgreSQL devuelve COUNT(*) como texto, no como número -- hay que convertirlo
            // explícitamente, o "+=" termina pegando texto en vez de sumar (ej. "0"+"5" = "05")
            const cantidad = Number(fila.total);
            conteos.total += cantidad;
            if (PENDIENTES.includes(fila.nombre_estado)) conteos.pendientes += cantidad;
            if (fila.nombre_estado === "FINALIZADA") conteos.finalizadas += cantidad;
            if (fila.nombre_estado === "CANCELADA") conteos.canceladas += cantidad;
        });

        // Mismo motivo: los COUNT(*) FILTER también vienen como texto desde PostgreSQL
        const conteosPreRevision = {
            pendientes: Number(preRevisiones.pendientes),
            requierenReparacion: Number(preRevisiones.requieren_reparacion),
            noRequierenReparacion: Number(preRevisiones.no_requieren_reparacion),
            total: Number(preRevisiones.total)
        };

        res.json({
            conteos,
            ordenesRecientes: recientes,
            tecnicos,
            resenas,
            preRevisiones: conteosPreRevision
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { obtenerResumen };