import { useState } from "react";
import axios from '../../axiosConfig';
import { useToast } from "../../context/ToastContext";
import ConfirmModal from '../ConfirmModal';

function UnidadMedtTable({ undMed, setIdSeleccionado, getUnidadMed }) {
    const { mostrarToast } = useToast();
    const [unidadParaEliminar, setUnidadParaEliminar] = useState(null);

    if (!undMed || !Array.isArray(undMed)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-ruler rs-empty-icon"></i>
                <p className="rs-empty-text">No hay unidades de medida disponibles.</p>
            </div>
        );
    }

    if (undMed.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron unidades.</p>
            </div>
        );
    }

    const elimUnidadMed = (id) => {
        setUnidadParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = unidadParaEliminar;
        setUnidadParaEliminar(null);
        axios.delete(`/api/unidad_de_medida/eliminar/${id}`)
            .then(() => {
                mostrarToast("Unidad de medida eliminada con éxito.", "success");
                getUnidadMed();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar la unidad de medida.", "error");
            });
    };

    return (
        <>
            <div className="rs-table-wrapper">
                <table className="rs-table rs-table-sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {undMed.map((u) => (
                            <tr key={u.id_unidad}>
                                <td>{u.id_unidad}</td>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{u.nombre}</td>
                                <td>
                                    <div className="rs-actions">
                                        <button
                                            onClick={() => setIdSeleccionado(u)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            onClick={() => elimUnidadMed(u.id_unidad)}
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

            {unidadParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar esta unidad de medida?"
                    message="Esta acción no se puede deshacer. Si hay insumos usando esta unidad, no se podrá eliminar."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setUnidadParaEliminar(null)}
                />
            )}
        </>
    );
}

export default UnidadMedtTable;