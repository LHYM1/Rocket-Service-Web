import db from '../../config/db.js';

/**
 * RF-004.7 – Consultar insumos usados en servicio (solo lectura).
 * No existen create/update/delete: esta tabla es un registro histórico
 * generado al asociar insumos a una orden (RF-006.9), no se edita aquí.
 *
 * 
 * Tener en cuenta que en precio unitario coloqué el precio total (cantidad * precio unitario)
 */
const insumosUsados = {
    findAll: async () => {
        const query = `
            SELECT 
                iu.id_insumos_orden,
                iu.id_orden,
                CONCAT('ORD-', LPAD(iu.id_orden, 3, '0')) AS codigo_orden,
                i.nombre_insumo AS nombre_insumo,
                um.nombre AS unidad_medida,
                iu.cantidad,
                iu.precio_unitario_snapshot,
                (iu.cantidad * iu.precio_unitario_snapshot) AS precio_total
            FROM insumos_usados_en_servicio iu
            INNER JOIN insumos i ON iu.id_insumo = i.id_insumo
            LEFT JOIN unidad_de_medida um ON i.id_unidad = um.id_unidad
            ORDER BY iu.id_orden DESC, iu.id_insumos_orden ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

export default insumosUsados;