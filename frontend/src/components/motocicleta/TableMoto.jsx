import axios from "../../axiosConfig";

function TableMoto({ moto, setIdSeleccionado, getMoto }) {
    if (!moto || !Array.isArray(moto) || moto.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fas fa-motorcycle rs-empty-icon"></i>
                <p className="rs-empty-text">No hay motocicletas registradas o coincidentes con la búsqueda.</p>
            </div>
        );
    }

    const eliminarMoto = (id) => {
        if (window.confirm("¿Estás seguro de desactivar esta motocicleta?")) {
            axios.put(`/api/motocicleta/estado/${id}`, { estado: 0 })
                .then(() => {
                    alert("Motocicleta desactivada con éxito");
                    getMoto();
                })
                .catch(err => {
                    console.error("Error al desactivar motocicleta:", err);
                    alert(err.response?.data?.message || "No se pudo desactivar la motocicleta");
                });
        }
    };

    return (
        <div className="rs-table-wrapper">
            <table className="rs-table">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Cliente / Dueño</th>
                        <th>Modelo</th>
                        <th>Kilometraje Actual</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {moto.map((mt) => {
                        // Truncar decimales para asegurar que aparezcan como enteros (Ej: 2000 => 2.000 KM)
                        const kmEntero = Math.trunc(Number(mt.kilometraje_actual || 0));
                        const kmFormateado = kmEntero.toLocaleString("es-CO", { maximumFractionDigits: 0 });

                        return (
                            <tr key={mt.id_moto}>
                                <td>
                                    <span className="rs-id-badge">{mt.placa}</span>
                                </td>
                                <td style={{ fontWeight: 500 }}>
                                    {mt.nombre_usuario && mt.apellido_usuario 
                                        ? `${mt.nombre_usuario} ${mt.apellido_usuario}` 
                                        : "Sin Asignar"}
                                </td>
                                <td>
                                    <span className="rs-cat-badge">
                                        {mt.nombre_modelo || "Sin Modelo"}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                    {kmFormateado} KM
                                </td>
                                <td>
                                    <span 
                                        className={`rs-status-badge ${mt.estado === 1 ? 'rs-status-active' : 'rs-status-inactive'}`}
                                        style={mt.estado === 1 ? {
                                            backgroundColor: "#d1fae5",
                                            color: "#065f46",
                                            border: "1px solid #a7f3d0",
                                            padding: "4px 8px",
                                            borderRadius: "12px",
                                            fontWeight: "bold",
                                            display: "inline-block"
                                        } : {}}
                                    >
                                        {mt.estado === 1 ? "Activa" : "Inactiva"}
                                    </span>
                                </td>
                                <td>
                                    <div className="rs-actions" style={{ justifyContent: "center" }}>
                                        <button
                                            onClick={() => setIdSeleccionado(mt)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar motocicleta"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => eliminarMoto(mt.id_moto)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Desactivar motocicleta"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TableMoto;