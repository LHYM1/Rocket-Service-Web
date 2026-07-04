import axios from '../../axiosConfig'

// la prop tipServ viene del padre page, es arreglo que muestra la tabla
// la prop setIdSeleccionado viene del padre page
// la prop getTipoServicio viene del padre page
// la prop esAdmin viene del padre page

function TypeServTable ({ tipServ, setIdSeleccionado, getTipoServicio, esAdmin }) {
    if (!tipServ || !Array.isArray(tipServ)) {
        return <p>No hay tipos de servicio disponibles</p>;
    }

    const eliminarTipServ = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este tipo de servicio?")) {
            axios.delete(`http://localhost:4000/api/tipo_servicio/eliminar/${id}`)
            .then(() => {
                alert("Tipo de servicio eliminado con éxito");
                getTipoServicio(); // función que viene del padre page
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar el tipo de servicio");
            }); 
        } else {
            alert("El tipo de servicio no fue eliminado");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        {esAdmin && <th>Id</th>}
                        <th>Nombre</th>
                        <th>Descripción</th>
                        {esAdmin && <th>Acciones</th>}
                    </tr>
                </thead>

                <tbody>
                    {tipServ.map((ts) => (
                        <tr key={ts.id_tipo_servicio }>
                            {esAdmin && <td>{ts.id_tipo_servicio}</td>}
                            <td>{ts.nombre_servicio}</td>
                            <td>{ts.descripcion_servicio}</td>

                        {esAdmin && ( 
                                <td>
                                    <button onClick={() => setIdSeleccionado(ts)}
                                        type="button" className="btn btn-warning btn-color">
                                        Editar
                                    </button>

                                    <button onClick={() => eliminarTipServ(ts.id_tipo_servicio)}
                                        type="button" className="btn btn-danger btn-color">
                                        Eliminar
                                    </button>
                                </td>
                            )}
                        </tr>                    
                    ))}
                    
                </tbody>
            </table>
        </div> 
    )
}

export default TypeServTable;
  
