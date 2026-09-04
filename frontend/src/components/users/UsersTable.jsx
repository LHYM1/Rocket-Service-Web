import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';

function UsersTable({ user, setIdSeleccionado, getUsuarios }) {
    const { mostrarToast } = useToast();

    if (!user || !Array.isArray(user)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-users-slash rs-empty-icon"></i>
                <p className="rs-empty-text">No hay datos de usuarios disponibles.</p>
            </div>
        );
    }

    if (user.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron usuarios coincidentes.</p>
            </div>
        );
    }

    const desactivarUsuario = async (id) => {
        if (window.confirm("¿Deseas desactivar este usuario?")) {
            try {
                await axios.put(`http://localhost:4000/api/usuarios/eliminar/${id}`);
                mostrarToast("Usuario desactivado correctamente.", "success");
                getUsuarios();
            } catch (error) {
                const msg = error.response?.data?.message || "Error al desactivar el usuario.";
                mostrarToast(msg, "error");
            }
        }
    };

    const restaurarUsuario = async (id) => {
        if (window.confirm("¿Deseas reactivar este usuario?")) {
            try {
                await axios.put(`http://localhost:4000/api/usuarios/restaurar/${id}`);
                mostrarToast("Usuario reactivado correctamente.", "success");
                getUsuarios();
            } catch (error) {
                const msg = error.response?.data?.message || "Error al activar el usuario.";
                mostrarToast(msg, "error");
            }
        }
    };

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table rs-table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre completo</th>
                        <th>Correo electrónico</th>
                        <th>Teléfono</th>
                        <th>Categoría / Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {user.map((u) => (
                        <tr key={u.id_usuario}>
                            <td><span className="rs-id-badge">#{u.id_usuario}</span></td>
                            <td style={{ color: '#1a1a2e', fontWeight: '500' }}>
                                {u.nombre} {u.apellido}
                            </td>
                            <td>{u.correo_usuario}</td>
                            <td>{u.telefono_usuario || "N/A"}</td>
                            <td>
                                <span className="rs-cat-badge">
                                    {u.categoria_usuario || "Sin Asignar"}
                                </span>
                            </td>
                            <td>
                                {u.estado === 1
                                    ? <span className="rs-badge rs-badge-success">Activo</span>
                                    : <span className="rs-badge rs-badge-muted">Inactivo</span>
                                }
                            </td>
                            <td>
                                <div className="rs-actions">
                                    <button
                                        onClick={() => setIdSeleccionado(u)}
                                        className="rs-btn rs-btn-icon rs-btn-edit"
                                        title="Editar"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    {u.estado === 1 ? (
                                        <button
                                            onClick={() => desactivarUsuario(u.id_usuario)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Desactivar"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => restaurarUsuario(u.id_usuario)}
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

export default UsersTable;