import { useState } from "react";
import axios from '../../axiosConfig';
import { useToast } from "../../context/ToastContext";
import ConfirmModal from '../ConfirmModal';

function RolesTable({ roles, setIdSeleccionado, getRoles }) {
    const { mostrarToast } = useToast();
    const [rolParaEliminar, setRolParaEliminar] = useState(null);

    if (!roles || !Array.isArray(roles)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-user-tag rs-empty-icon"></i>
                <p className="rs-empty-text">No hay roles disponibles.</p>
            </div>
        );
    }

    if (roles.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron roles.</p>
            </div>
        );
    }

    const eliminarRol = (id) => {
        setRolParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = rolParaEliminar;
        setRolParaEliminar(null);
        axios.delete(`/api/clasificacion_de_usuarios/eliminar/${id}`)
            .then(() => {
                mostrarToast("Rol eliminado con éxito.", "success");
                getRoles();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar el rol.", "error");
            });
    };

    return (
        <>
            <div className="rs-table-wrapper">
                <table className="rs-table rs-table-sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r) => (
                            <tr key={r.id_tipo_usuario}>
                                <td>{r.id_tipo_usuario}</td>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{r.categoria_usuario}</td>
                                <td>
                                    <div className="rs-actions">
                                        <button
                                            onClick={() => setIdSeleccionado(r)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            onClick={() => eliminarRol(r.id_tipo_usuario)}
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

            {rolParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar este rol?"
                    message="Esta acción no se puede deshacer. Si hay usuarios usando este rol, no se podrá eliminar."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setRolParaEliminar(null)}
                />
            )}
        </>
    );
}

export default RolesTable;