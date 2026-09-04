import axios from '../../axiosConfig';

function TableMoto({ moto, setIdSeleccionado, getMoto }) {
    if (!moto || !Array.isArray(moto) || moto.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fas fa-motorcycle rs-empty-icon"></i>
                <p className="rs-empty-text">No hay motocicletas registradas o disponibles.</p>
            </div>
        );
    }

    const eliminarMoto = (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta motocicleta?")) {
            axios.delete(`http://localhost:4000/api/motocicleta/eliminar/${id}`)
                .then(() => {
                    alert("Motocicleta eliminada con éxito");
                    getMoto();
                })
                .catch(err => {
                    console.error("Error al eliminar motocicleta:", err);
                    alert("No se pudo eliminar la motocicleta");
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
                        <th style={{ textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {moto.map((mt) => (
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
                                {mt.kilometraje_actual} km
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
                                        title="Eliminar motocicleta"
                                    >
                                        <i className="fas fa-trash-alt"></i>
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

export default TableMoto;