import { useState } from 'react';
import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';

function UsersTable({ user, setIdSeleccionado, getUsuarios }) {
    const { mostrarToast } = useToast();
    const [cargandoReenvio, setCargandoReenvio] = useState(null); // Guarda el ID del usuario en proceso

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

    // Petición para reenviar el token de activación o enlace
    const reenviarToken = async (u) => {
        try {
            setCargandoReenvio(u.id_usuario);
            await axios.post(`http://localhost:4000/api/usuarios/reenviar-token/${u.id_usuario}`);
            mostrarToast(`Código de activación reenviado con éxito a ${u.correo_usuario}`, "success");
        } catch (error) {
            const msg = error.response?.data?.message || "Error al reenviar el token de activación.";
            mostrarToast(msg, "error");
        } finally {
            setCargandoReenvio(null);
        }
    };

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

    // Helper para renderizar los badges de estado
    const renderEstadoBadge = (estado) => {
        switch (estado) {
            case 2:
                return <span className="rs-badge rs-badge-success">Activo</span>;
            case 1:
                return <span className="rs-badge rs-badge-warning" style={{ backgroundColor: '#fff3e0', color: '#b75300' }}><i className="fa-solid fa-clock me-1"></i>Pendiente</span>;
            case 0:
            default:
                return <span className="rs-badge rs-badge-muted"><i className="fa-solid fa-circle-xmark me-1"></i>Inactivo</span>;
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
                                {u.nombre || u.apellido ? `${u.nombre || ''} ${u.apellido || ''}`.trim() : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin completar</span>}
                            </td>
                            <td>{u.correo_usuario}</td>
                            <td>{u.telefono_usuario || "N/A"}</td>
                            <td>
                                <span className="rs-cat-badge">
                                    {u.categoria_usuario || "Sin Asignar"}
                                </span>
                            </td>
                            <td>
                                {renderEstadoBadge(u.estado)}
                            </td>
                            <td>
                                <div className="rs-actions">
                                    {/* Editar (Solo si está completamente registrado/activo) */}
                                    {u.estado === 2 && (
                                        <button
                                            onClick={() => setIdSeleccionado(u)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar usuario"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                    )}

                                    {/* Reenviar Token (Solo si está en estado Pendiente) */}
                                    {u.estado === 1 && (
                                        <button
                                            onClick={() => reenviarToken(u)}
                                            className="rs-btn rs-btn-icon"
                                            style={{ backgroundColor: '#fff3e0', color: '#b75300' }}
                                            title="Reenviar token / enlace de activación"
                                            disabled={cargandoReenvio === u.id_usuario}
                                        >
                                            <i className={`fa-solid ${cargandoReenvio === u.id_usuario ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                                        </button>
                                    )}

                                    {/* Inactivar / Reactivar */}
                                    {u.estado !== 0 ? (
                                        <button
                                            onClick={() => desactivarUsuario(u.id_usuario)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Desactivar usuario"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => restaurarUsuario(u.id_usuario)}
                                            className="rs-btn rs-btn-icon rs-btn-reactivate"
                                            title="Reactivar usuario"
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