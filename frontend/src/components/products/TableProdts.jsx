function TableProdts({ product, setIdSeleccionado, getProduct }) {
    if (!product || !Array.isArray(product)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-box-open rs-empty-icon"></i>
                <p className="rs-empty-text">No hay insumos disponibles.</p>
            </div>
        );
    }

    if (product.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron insumos.</p>
            </div>
        );
    }

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table rs-table-sm">
                <thead>
                    <tr>
                        <th>Nombre insumo</th>
                        <th>Categoría</th>
                        <th>Unidad</th>
                        <th>Stock</th>
                        <th>Precio unitario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {product.map((p) => (
                        <tr key={p.id_insumo}>
                            <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{p.nombre_insumo}</td>
                            <td><span className="rs-cat-badge">{p.categoria}</span></td>
                            <td>{p.unidad_de_medida}</td>
                            <td>
                                {p.cantidad_disponible === 0
                                    ? <span className="rs-badge rs-badge-danger">No disponible</span>
                                    : <span className="rs-badge rs-badge-success">
                                        {p.cantidad_disponible} {p.simbolo_unidad || ""}
                                      </span>
                                }
                            </td>
                            <td className="rs-precio">
                                ${Number(p.precio_unitario).toLocaleString('es-CO')}
                            </td>
                            <td>
                                {p.estado
                                    ? <span className="rs-badge rs-badge-success">Activo</span>
                                    : <span className="rs-badge rs-badge-muted" title="Se reactiva automáticamente al agregar stock desde Editar">Inactivo</span>
                                }
                            </td>
                            <td>
                                <div className="rs-actions">
                                    <button
                                        onClick={() => setIdSeleccionado(p)}
                                        className="rs-btn rs-btn-icon rs-btn-edit"
                                        title="Editar"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TableProdts;