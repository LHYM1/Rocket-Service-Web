// Nota: ya no recibe setIdSeleccionado ni getInsUsServ -- esta tabla ahora es
// SOLO de lectura (sin editar/eliminar), ya que los registros se generan
// automáticamente cuando el Técnico cotiza insumos en una orden, no manualmente.
function TablePrUSer({ insUsaServ, esAdmin }) {

    if (!insUsaServ || !Array.isArray(insUsaServ)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-boxes-stacked rs-empty-icon"></i>
                <p className="rs-empty-text">No hay insumos usados en servicio disponibles.</p>
            </div>
        );
    }

    if (insUsaServ.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron registros.</p>
            </div>
        );
    }

    const formatearPrecio = (valor) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0);

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table rs-table-sm">
                <thead>
                    <tr>
                        <th>Orden</th>
                        <th>Insumo</th>
                        <th>Cantidad</th>
                        <th>Precio Total</th>
                    </tr>
                </thead>
                <tbody>
                    {insUsaServ.map((ts) => {
                        const precioTotal = (Number(ts.cantidad) || 0) * (Number(ts.precio_unitario_snapshot) || 0);
                        return (
                            <tr key={ts.id_insumos_orden}>
                                <td>
                                    {/* Mismo estilo de "chip" que usa la columna Placa en Motocicletas */}
                                    <span className="rs-id-badge">
                                        {ts.codigo_orden || `ORD-${String(ts.id_orden).padStart(3, "0")}`}
                                    </span>
                                </td>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{ts.nombre_insumo || "No definido"}</td>
                                <td>{ts.cantidad} {ts.nombre_unidad || ""}</td>
                                <td style={{ color: '#1a1a2e', fontWeight: '600' }}>{formatearPrecio(precioTotal)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TablePrUSer;