import axios from 'axios'

function TableModelo ({ modelo, setIdSeleccionado, getModelo }) {

    if (!modelo || !Array.isArray(modelo)) {
        return <p>No hay modelos disponibles</p>;
    }

    const eliminarModelo = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este modelo?")) {
            axios.delete(`http://localhost:4000/api/modelo/eliminar/${id}`)
            .then(() => {
                alert("Modelo eliminado con éxito");
                getModelo(); // función para listar (viene del padre page)
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar el modelo");
            }); 
        } else {
            alert("El modelo no fue eliminado");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id Modelo</th>
                        <th>Nombre</th>
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {modelo.map((mod) => (
                        <tr key={mod.id_modelo}>
                            <td>{mod.id_modelo}</td>
                            <td>{mod.nombre}</td>       
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(mod)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => eliminarModelo(mod.id_modelo)}
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

export default TableModelo;
  
