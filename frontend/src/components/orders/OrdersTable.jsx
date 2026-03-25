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
        <table className="table table-hover table-bordered shadow-sm">
            <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Técnico</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Costo Final</th>
                    <th className="text-center">Acciones</th>
                </tr>
            </thead>

            <tbody>
                {ordenes.map((o) => (
                    <tr key={o.id_orden}>
                        <td>{o.id_orden}</td>
                        <td><strong>{o.codigo_orden}</strong></td>
                        <td>{o.id_tecnico_asignado}</td> {/* Aquí podrías mostrar el nombre si haces un JOIN en el backend */}
                        <td>
                            <span className={`badge ${o.id_estado_de_servicio === 3 ? 'bg-success' : 'bg-info'}`}>
                                {o.id_estado_de_servicio}
                            </span>
                        </td>
                        <td>{new Date(o.fecha_creacion).toLocaleDateString()}</td>
                        <td>${Number(o.costo_total_final).toLocaleString()}</td>

                        <td className="text-center">
                            <button 
                                onClick={() => setIdSeleccionado(o)}
                                type="button" 
                                className="btn btn-warning btn-sm me-2"
                            >
                                <i className="bi bi-pencil"></i> Editar
                            </button>

                            <button 
                                onClick={() => eliminarOrden(o.id_orden, o.codigo_orden)}
                                type="button" 
                                className="btn btn-danger btn-sm"
                            >
                                <i className="bi bi-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>                    
                ))}
            </tbody>
        </table>
    )
}

export default OrdenesTable;