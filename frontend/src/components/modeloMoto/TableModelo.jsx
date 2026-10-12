import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';

function TableModelo({ modelo, setIdSeleccionado, getModelo }) {
    const { mostrarToast } = useToast();

    if (!modelo || !Array.isArray(modelo)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-motorcycle rs-empty-icon"></i>
                <p className="rs-empty-text">No hay modelos disponibles.</p>
            </div>
        );
    }

    if (modelo.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron modelos.</p>
            </div>
        );
    }

    const desactivarModelo = async (id) => {
        if (window.confirm("¿Deseas desactivar este modelo de motocicleta?")) {
            try {
                await axios.patch(`/api/modelo/desactivar/${id}`);
                mostrarToast("Modelo de motocicleta desactivado satisfactoriamente.", "success");
                getModelo();
            } catch (error) {
                const msg = error.response?.data?.message || "No se pudo desactivar el modelo.";
                mostrarToast(msg, "error");
            }
        }
    };

    const reactivarModelo = async (id) => {
        try {
            await axios.patch(`/api/modelo/reactivar/${id}`);
            mostrarToast("Modelo reactivado correctamente.", "success");
            getModelo();
        } catch (error) {
            const msg = error.response?.data?.message || "No se pudo reactivar el modelo.";
            mostrarToast(msg, "error");
        }
    };

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table rs-table-sm">
                <thead>
                    <tr>
                        <th>Nombre del modelo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {modelo.map((m) => (
                        <tr key={m.id_modelo}>
                            <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{m.nombre}</td>
                            <td>
                                {m.estado === 1
                                    ? <span className="rs-badge rs-badge-success">Activo</span>
                                    : <span className="rs-badge rs-badge-muted">Inactivo</span>
                                }
                            </td>
                            <td>
                                <div className="rs-actions">
                                    <button
                                        onClick={() => setIdSeleccionado(m)}
                                        className="rs-btn rs-btn-icon rs-btn-edit"
                                        title="Editar"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    {m.estado === 1 ? (
                                        <button
                                            onClick={() => desactivarModelo(m.id_modelo)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Desactivar"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => reactivarModelo(m.id_modelo)}
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

export default TableModelo;