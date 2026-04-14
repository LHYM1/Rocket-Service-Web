import axios from 'axios'

function TableEstdOrdenServ ({ estadoOrd, setIdSeleccionado, getEstadoOrden }) {
    
    if (!estadoOrd || !Array.isArray(estadoOrd)) {
        return <p>No hay estados de orden disponibles</p>;
    }

    const elimarEstadoOrden = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este estado de orden?")) {
            axios.delete(`http://localhost:4000/api/estado_de_orden_de_servicio/eliminar/${id}`)
            .then(() => {
                alert("Estado orden eliminado con éxito");
                getEstadoOrden();
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar el estado de la orden");
            }); 
        } else {
            alert("Estado de orden eliminado");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <td>Id</td>
                        <th>Nombre estado</th>
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {estadoOrd.map((estdOrd) => (
                        <tr key={estdOrd.id_estado_de_servicio }>
                            <td>{estdOrd.id_estado_de_servicio}</td>
                            <td>{estdOrd.nombre_estado}</td>         
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(estdOrd)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => elimarEstadoOrden(estdOrd.id_estado_de_servicio)}
                                    type="button" className="btn btn-danger btn-color">
                                    Eliminar
                                </button>
                            </td>
                        </tr>                    
                    ))}
                    
                </tbody>
            </table>
        </div> 
    )
}

export default TableEstdOrdenServ;
  
