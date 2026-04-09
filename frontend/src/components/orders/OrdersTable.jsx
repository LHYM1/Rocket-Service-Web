import axios from 'axios'

function OrdenesTable ({ ordenes, setIdSeleccionado, getOrdenes }) {
    // Cambiamos la validación para que coincida con el nuevo nombre de prop
    if (!ordenes || !Array.isArray(ordenes)) {
        return <p className="text-center">No hay órdenes de servicio disponibles</p>;
    }

    const eliminarOrden = (id, codigo) => {
        if (window.confirm(`¿Estás seguro de eliminar la orden ${codigo}?`)) {
            axios.delete(`http://localhost:4000/api/ordenes_de_servicio/eliminar/${id}`)
            .then(() => {
                alert("Orden eliminada con éxito");
                getOrdenes(); // Refresca la lista
            })
            .catch(err => {
                console.error(err);
                alert("No se pudo eliminar la orden. Verifique la conexión con el servidor.");
            }); 
        }
    }

    return (
        <div className="card shadow-sm border-0">
    <div className="card-body">

        <div className="table-responsive">
            <table className="table table-hover align-middle">
                
                <thead className="table-dark text-center">
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Placa</th>
                        <th>Cliente</th>
                        <th>Técnico</th>
                        <th>Problema</th>
                        <th>Estado</th>
                        <th>Servicio</th>
                        <th>Creación</th>
                        <th>Finalización</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {ordenes.map((o) => (
                        <tr key={o.id_orden}>

                            <td>{o.id_orden}</td>

                            <td>
                                <span className="fw-bold text-primary">
                                    {o.codigo_orden}
                                </span>
                            </td>

                            <td>{o.placa}</td>
                            <td>{o.cliente}</td>
                            <td>{o.tecnico}</td>

                            {/* Problema recortado */}
                            <td style={{ maxWidth: "150px" }}>
                                <span className="text-truncate d-inline-block w-100">
                                    {o.descripcion_del_problema}
                                </span>
                            </td>

                            {/*  Estado con badge */}
                            <td className="text-center">
                                <span className={`badge ${
                                    o.nombre_estado === "ASIGNADA" ? "bg-primary" :
                                    o.nombre_estado === "EN PROCESO" ? "bg-warning text-dark" :
                                    o.nombre_estado === "FINALIZADA" ? "bg-success" :
                                    "bg-secondary"
                                }`}>
                                    {o.nombre_estado}
                                </span>
                            </td>

                            <td>{o.nombre_servicio}</td>

                            <td>
                                {new Date(o.fecha_de_creacion).toLocaleDateString()}
                            </td>

                            <td>
                                {o.fecha_finalizacion_estimada
                                    ? new Date(o.fecha_finalizacion_estimada).toLocaleDateString()
                                    : <span className="text-muted">—</span>
                                }
                            </td>

                            {/* Botones mejorados */}
                            <td className="text-center">
                                <button 
                                    onClick={() => setIdSeleccionado(o)}
                                    className="btn btn-outline-warning btn-sm me-2"
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>

                                <button 
                                    onClick={() => eliminarOrden(o.id_orden, o.codigo_orden)}
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    </div>
</div>
    )
}

export default OrdenesTable;