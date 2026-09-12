import { useState } from "react";
import axios from "../../axiosConfig";

const API_BASE_URL = "http://localhost:4000/api";

function TableCategoria({ categorias, setIdSeleccionado, getCategoria }) {
    const [procesandoId, setProcesandoId] = useState(null);

    if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fas fa-tags rs-empty-icon"></i>
                <p className="rs-empty-text">No hay categorías registradas o coincidentes con la búsqueda.</p>
            </div>
        );
    }

    const cambiarEstado = (cat) => {
        const nuevoEstado = cat.estado === 1 ? 0 : 1;
        const accion = nuevoEstado === 1 ? "activar" : "desactivar";

        if (!window.confirm(`¿Estás seguro de ${accion} esta categoría?`)) return;

        setProcesandoId(cat.id_categoria);
        axios.put(`${API_BASE_URL}/categoria/estado/${cat.id_categoria}`, { estado: nuevoEstado })
            .then(() => {
                alert(`Categoría ${nuevoEstado === 1 ? "activada" : "desactivada"} con éxito`);
                getCategoria();
            })
            .catch(err => {
                console.error(`Error al ${accion} categoría:`, err);
                alert(err.response?.data?.message || `No se pudo ${accion} la categoría`);
            })
            .finally(() => setProcesandoId(null));
    };

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Insumos asociados</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((cat) => (
                        <tr key={cat.id_categoria}>
                            <td>
                                <span className="rs-id-badge">{cat.nombre}</span>
                            </td>
                            <td style={{ maxWidth: "320px" }}>
                                {cat.Descripcion || <span style={{ color: "#9ca3af" }}>Sin descripción</span>}
                            </td>
                            <td style={{ fontWeight: 600, textAlign: "center" }}>
                                {cat.total_insumos ?? 0}
                            </td>
                            <td>
                                <span
                                    className={`rs-status-badge ${cat.estado === 1 ? 'rs-status-active' : 'rs-status-inactive'}`}
                                    style={cat.estado === 1 ? {
                                        backgroundColor: "#d1fae5",
                                        color: "#065f46",
                                        border: "1px solid #a7f3d0",
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontWeight: "bold",
                                        display: "inline-block"
                                    } : {
                                        backgroundColor: "#fee2e2",
                                        color: "#991b1b",
                                        border: "1px solid #fecaca",
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontWeight: "bold",
                                        display: "inline-block"
                                    }}
                                >
                                    {cat.estado === 1 ? "Activa" : "Inactiva"}
                                </span>
                            </td>
                            <td>
                                <div className="rs-actions" style={{ justifyContent: "center" }}>
                                    <button
                                        onClick={() => setIdSeleccionado(cat)}
                                        className="rs-btn rs-btn-icon rs-btn-edit"
                                        title="Editar categoría"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => cambiarEstado(cat)}
                                        className={`rs-btn rs-btn-icon ${cat.estado === 1 ? 'rs-btn-delete' : 'rs-btn-edit'}`}
                                        title={cat.estado === 1 ? "Desactivar categoría" : "Activar categoría"}
                                        disabled={procesandoId === cat.id_categoria}
                                    >
                                        <i className={`fas ${cat.estado === 1 ? 'fa-ban' : 'fa-check-circle'}`}></i>
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

export default TableCategoria;
