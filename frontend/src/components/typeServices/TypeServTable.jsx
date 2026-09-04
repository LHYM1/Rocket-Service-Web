import axios from "axios";

function TypeServTable({ tipServ, setIdSeleccionado, getTipoServicio, esAdmin, showToast }) {
    const eliminarTipServ = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de eliminar el tipo de servicio "${nombre}"?`)) {
            try {
                const res = await axios.delete(`http://localhost:4000/api/tipo_servicio/eliminar/${id}`);
                showToast(res.data.message || "Tipo de servicio eliminado", "success");
                getTipoServicio();
            } catch (err) {
                console.error(err);
                const errorMsg = err.response?.data?.message || "No se pudo eliminar";
                showToast(errorMsg, "error");
            }
        }
    };

    const cambiarEstado = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 1 ? 0 : 1;
        try {
            await axios.patch(`http://localhost:4000/api/tipo_servicio/estado/${id}`, { estado: nuevoEstado });
            showToast("Estado actualizado correctamente", "success");
            getTipoServicio();
        } catch (err) {
            console.error(err);
            showToast("No se pudo cambiar el estado", "error");
        }
    };

    if (!tipServ || !Array.isArray(tipServ) || tipServ.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-screwdriver-wrench rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron tipos de servicio registrados.</p>
            </div>
        );
    }

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table">
                <thead>
                    <tr>
                        {esAdmin && <th style={{ width: "80px" }}>ID</th>}
                        <th>Nombre del Servicio</th>
                        <th>Descripción</th>
                        <th style={{ width: "120px", textAlign: "center" }}>Estado</th>
                        {esAdmin && <th style={{ width: "140px", textAlign: "center" }}>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {tipServ.map((ts) => (
                        <tr key={ts.id_tipo_servicio}>
                            {esAdmin && (
                                <td>
                                    <span className="rs-id-badge">#{ts.id_tipo_servicio}</span>
                                </td>
                            )}
                            <td style={{ fontWeight: "600", color: "#1a1a2e" }}>
                                {ts.nombre_servicio}
                            </td>
                            <td>
                                {ts.descripcion_servicio || (
                                    <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                                        Sin descripción
                                    </span>
                                )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                                <button
                                    onClick={() => esAdmin && cambiarEstado(ts.id_tipo_servicio, ts.estado)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: esAdmin ? "pointer" : "default"
                                    }}
                                >
                                    <span className={`rs-badge ${Number(ts.estado) === 1 ? "rs-badge-active" : "rs-badge-inactive"}`}>
                                        {Number(ts.estado) === 1 ? "Activo" : "Inactivo"}
                                    </span>
                                </button>
                            </td>
                            {esAdmin && (
                                <td>
                                    <div className="rs-actions" style={{ justifyContent: "center" }}>
                                        <button 
                                            onClick={() => setIdSeleccionado(ts)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button 
                                            onClick={() => eliminarTipServ(ts.id_tipo_servicio, ts.nombre_servicio)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Eliminar"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TypeServTable;