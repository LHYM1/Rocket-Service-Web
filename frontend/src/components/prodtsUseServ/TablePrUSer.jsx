import { useState } from "react";
import axios from '../../axiosConfig';
import { useToast } from "../../context/ToastContext";
import ConfirmModal from '../ConfirmModal';

function TablePrUSer({ insUsaServ, setIdSeleccionado, getInsUsServ, esAdmin }) {
    const { mostrarToast } = useToast();
    const [insumoParaEliminar, setInsumoParaEliminar] = useState(null);

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

    const elimInsUseServ = (id) => {
        setInsumoParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = insumoParaEliminar;
        setInsumoParaEliminar(null);
        axios.delete(`/api/insumos_usados_en_servicio/eliminar/${id}`)
            .then(() => {
                mostrarToast("Insumo de servicio eliminado con éxito.", "success");
                getInsUsServ();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar el insumo de servicio.", "error");
            });
    };

    return (
        <>
            <div className="rs-table-wrapper">
                <table className="rs-table rs-table-sm">
                    <thead>
                        <tr>
                            {esAdmin && <th>ID</th>}
                            <th>Orden</th>
                            <th>Insumo</th>
                            <th>Cantidad</th>
                            {esAdmin && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {insUsaServ.map((ts) => (
                            <tr key={ts.id_insumos_orden}>
                                {esAdmin && <td>{ts.id_insumos_orden}</td>}
                                <td>{ts.codigo_orden || `ORD-${String(ts.id_orden).padStart(3, "0")}`}</td>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{ts.nombre_insumo || "No definido"}</td>
                                <td>{ts.cantidad} {ts.nombre_unidad || ""}</td>
                                {esAdmin && (
                                    <td>
                                        <div className="rs-actions">
                                            <button
                                                onClick={() => setIdSeleccionado(ts)}
                                                className="rs-btn rs-btn-icon rs-btn-edit"
                                                title="Editar"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => elimInsUseServ(ts.id_insumos_orden)}
                                                className="rs-btn rs-btn-icon rs-btn-delete"
                                                title="Eliminar"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {insumoParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar este insumo de servicio?"
                    message="Esta acción no se puede deshacer."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setInsumoParaEliminar(null)}
                />
            )}
        </>
    );
}

export default TablePrUSer;