import { useState } from "react";
import axios from '../../axiosConfig';
import { useToast } from "../../context/ToastContext";
import ConfirmModal from '../ConfirmModal';

function RegstActvTable({ regstActv, setIdSeleccionado, getRegAct, esAdmin }) {
    const { mostrarToast } = useToast();
    const [registroParaEliminar, setRegistroParaEliminar] = useState(null);

    // Estilos de las 3 disponibilidades posibles, para identificarlas rápido de un vistazo
    const estiloDisponibilidad = {
        "Disponible": "rs-badge-success",
        "Realizando servicio": "rs-badge-warning",
        "Fuera de jornada": "rs-badge-muted"
    };

    if (!regstActv || !Array.isArray(regstActv)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-clipboard-list rs-empty-icon"></i>
                <p className="rs-empty-text">No hay registros de actividad disponibles.</p>
            </div>
        );
    }

    if (regstActv.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron registros.</p>
            </div>
        );
    }

    const elimRegAct = (id) => {
        setRegistroParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = registroParaEliminar;
        setRegistroParaEliminar(null);
        axios.delete(`/api/registro_actividad/eliminar/${id}`)
            .then(() => {
                mostrarToast("Registro eliminado con éxito.", "success");
                getRegAct();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar el registro.", "error");
            });
    };

    return (
        <>
            <div className="rs-table-wrapper">
                <table className="rs-table rs-table-sm">
                    <thead>
                        <tr>
                            {esAdmin && <th>ID</th>}
                            <th>Código registro</th>
                            <th>Orden</th>
                            <th>Técnico</th>
                            <th>Disponibilidad</th>
                            {esAdmin && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {regstActv.map((reg) => (
                            <tr key={reg.id_registro}>
                                {esAdmin && <td>{reg.id_registro}</td>}
                                <td>{reg.codigo_registro}</td>
                                <td>{reg.codigo_orden || "—"}</td>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>
                                    {reg.nombre_tecnico ? `${reg.nombre_tecnico} ${reg.apellido_tecnico || ""}` : "—"}
                                </td>
                                <td>
                                    <span className={`rs-badge ${estiloDisponibilidad[reg.estado_disponibilidad] || "rs-badge-muted"}`}>
                                        {reg.estado_disponibilidad || "Por definir"}
                                    </span>
                                </td>
                                {esAdmin && (
                                    <td>
                                        <div className="rs-actions">
                                            <button
                                                onClick={() => setIdSeleccionado(reg)}
                                                className="rs-btn rs-btn-icon rs-btn-edit"
                                                title="Editar"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => elimRegAct(reg.id_registro)}
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

            {registroParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar este registro?"
                    message="Esta acción no se puede deshacer."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setRegistroParaEliminar(null)}
                />
            )}
        </>
    );
}

export default RegstActvTable;