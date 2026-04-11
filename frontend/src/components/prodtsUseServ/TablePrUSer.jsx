import axios from 'axios'

function TypeServTable ({ insUsaServ, setIdSeleccionado, getInsUServ }) {
    if (!insUsaServ || !Array.isArray(insUsaServ)) {
        return <p>No hay insumos usados en servicio disponibles</p>;
    }

    const eliminarTipServ = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este insumo de servicio?")) {
            axios.delete(`http://localhost:4000/api/tipo_servicio/insumos_usados_en_servicio/eliminar/${id}`)
            .then(() => {
                alert("Insumo de servicio eliminado con éxito");
                getInsUServ(); // función que viene del padre page
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar el insumo de servicio");
            }); 
        } else {
            alert("El insumo de servicio no fue eliminado");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Orden</th>
                        <th>Insumo</th>
                        <th>Cantidad</th>
                        <th>Precio_unitario</th>
                        
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {tipServ.map((ts) => (
                        <tr key={ts.id_insumos_orden }>
                            <td>{ts.id_orden }</td>
                            <td>{ts.id_insumo }</td>
                            <td>{ts.cantidad}</td>
                            <td>{ts.precio_unitario}</td>
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(ts)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => eliminarTipServ(ts.id_insumos_orden)}
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
  
