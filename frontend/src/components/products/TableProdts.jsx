import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';

function TableProdts({ product, setIdSeleccionado, getProduct }) {
    const { mostrarToast } = useToast();

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

    const desactivarInsumo = async (id) => {
        if (window.confirm("¿Estás seguro de desactivar este insumo?")) {
            try {
                await axios.patch(`http://localhost:4000/api/insumos/desactivar/${id}`);
                mostrarToast("Insumo desactivado correctamente.", "success");
                getProduct();
            } catch (error) {
                const msg = error.response?.data?.message || "No se pudo desactivar el insumo.";
                mostrarToast(msg, "error");
            }
        }
    };

    const reactivarInsumo = async (id) => {
        try {
            await axios.patch(`http://localhost:4000/api/insumos/reactivar/${id}`);
            mostrarToast("Insumo reactivado correctamente.", "success");
            getProduct();
        } catch (error) {
            const msg = error.response?.data?.message || "No se pudo reactivar el insumo.";
            mostrarToast(msg, "error");
        }
    };

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
                                    : <span className="rs-badge rs-badge-success">{p.cantidad_disponible}</span>
                                }
                            </td>
                            <td className="rs-precio">
                                ${Number(p.precio_unitario).toLocaleString('es-CO')}
                            </td>
                            <td>
                                {p.estado === 1
                                    ? <span className="rs-badge rs-badge-success">Activo</span>
                                    : <span className="rs-badge rs-badge-muted">Inactivo</span>
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
                                    {p.estado === 1 ? (
                                        <button
                                            onClick={() => desactivarInsumo(p.id_insumo)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Desactivar"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => reactivarInsumo(p.id_insumo)}
                                            className="rs-btn rs-btn-icon rs-btn-reactivate"
                                            title="Reactivar"
                                        >
                                            <i className="fa-solid fa-arrows-rotate"></i>
                                        </button>
                                    )}
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