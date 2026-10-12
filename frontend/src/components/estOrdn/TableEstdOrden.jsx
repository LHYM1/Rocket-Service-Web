import { useState } from "react";
import axios from '../../axiosConfig';
import { useToast } from "../../context/ToastContext";
import ConfirmModal from '../ConfirmModal';

function TableEstdOrdenServ({ estadoOrd, setIdSeleccionado, getEstadoOrden }) {
    const { mostrarToast } = useToast();
    const [estadoParaEliminar, setEstadoParaEliminar] = useState(null);

    if (!estadoOrd || !Array.isArray(estadoOrd)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-list-check rs-empty-icon"></i>
                <p className="rs-empty-text">No hay estados de orden disponibles.</p>
            </div>
        );
    }

    if (estadoOrd.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron estados.</p>
            </div>
        );
    }

    const elimarEstadoOrden = (id) => {
        setEstadoParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = estadoParaEliminar;
        setEstadoParaEliminar(null);
        axios.delete(`/api/estado_de_orden_de_servicio/eliminar/${id}`)
            .then(() => {
                mostrarToast("Estado de orden eliminado con éxito.", "success");
                getEstadoOrden();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar el estado.", "error");
            });
    };

    return (
        <>
            <div className="rs-table-wrapper">
                <table className="rs-table rs-table-sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estadoOrd.map((estdOrd) => (
                            <tr key={estdOrd.id_estado_de_servicio}>
                                <td>{estdOrd.id_estado_de_servicio}</td>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{estdOrd.nombre_estado}</td>
                                <td>
                                    <div className="rs-actions">
                                        <button
                                            onClick={() => setIdSeleccionado(estdOrd)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            onClick={() => elimarEstadoOrden(estdOrd.id_estado_de_servicio)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Eliminar"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {estadoParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar este estado de orden?"
                    message="Esta acción no se puede deshacer. Si hay órdenes usando este estado, no se podrá eliminar."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setEstadoParaEliminar(null)}
                />
            )}
        </>
    );
}

export default TableEstdOrdenServ;