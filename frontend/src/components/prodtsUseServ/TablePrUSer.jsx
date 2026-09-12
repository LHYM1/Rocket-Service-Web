function TableInsumosUsados({ insumosUsados }) {
    if (!insumosUsados || !Array.isArray(insumosUsados) || insumosUsados.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fas fa-boxes-stacked rs-empty-icon"></i>
                <p className="rs-empty-text">No hay insumos usados registrados o coincidentes con la búsqueda.</p>
            </div>
        );
    }

    const formatearPrecio = (valor) =>
        Number(valor || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table">
                <thead>
                    <tr>
                        <th>Orden</th>
                        <th>Insumo</th>
                        <th>Cantidad</th>
                        <th>Precio total</th>
                    </tr>
                </thead>
                <tbody>
                    {insumosUsados.map((iu) => (
                        <tr key={iu.id_insumos_orden}>
                            <td>
                                <span className="rs-id-badge">{iu.codigo_orden}</span>
                            </td>
                            <td>{iu.nombre_insumo}</td>
                            <td>{iu.cantidad} {iu.unidad_medida || ""}</td>
                            <td style={{ fontWeight: 600 }}>{formatearPrecio(iu.precio_total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TableInsumosUsados;
