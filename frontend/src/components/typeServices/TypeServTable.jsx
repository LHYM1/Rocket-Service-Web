import axios from 'axios'

function TypeServTable ({ tipServ, setIdSeleccionado, getTipoServ }) {
    if (!tipServ || !Array.isArray(tipServ)) {
        return <p>No hay tipos de servicio disponibles</p>;
    }

    const eliminarTipServ = (id) => {
        axios.delete(`http://localhost:4000/api/tipo_servicio/eliminar/${id}`)
    
        .then(() => {
            alert("Tipo de servicio eliminado con éxito");
            getTipoServ();
        })
        .catch(err =>  {
            console.error(err);
            alert("No se pudo eliminar el tipo de servicio");
        }); 
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Costo servicio</th>
                        
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {tipServ.map((ts) => (
                        <tr key={ts.id_tipo_servicio }>
                            <td>{ts.id_tipo_servicio}</td>
                            <td>{ts.codigo_tipo_servicio}</td>
                            <td>{ts.nombre_servicio}</td>
                            <td>{ts.descripcion_servicio}</td>
                            <td>{ts.costo_servicio}</td>
                        

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
                        </tr>                    
                    ))}
                    
                </tbody>
            </table>
        </div> 
    )
}

export default TypeServTable;
  
