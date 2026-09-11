import axios from '../../axiosConfig'

function TableUnidadMed ({ undMed, setIdSeleccionado, getUnidadMed }) {

    if (!undMed || !Array.isArray(undMed)) {
        return <p>No hay unidades de medida disponibles</p>;
    }

    const elimUnidadMed = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar esta unidad de medida?")) {
            axios.delete(`/api/unidad_de_medida/eliminar/${id}`)
            .then(() => {
                alert("Unidad de medida eliminada con éxito");
                getUnidadMed();
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar la unidad de medida");
            }); 
        } else {
            alert("La unidad de medida no fue eliminada");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>nombre</th>

                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {undMed.map((undMed) => (
                        <tr key={undMed.id_unidad}>
                            <td>{undMed.id_unidad}</td>
                            <td>{undMed.nombre}</td>
                                  
                            <td>
                                <button onClick={() => setIdSeleccionado(undMed)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => elimUnidadMed(undMed.id_unidad)}
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

export default TableUnidadMed;
  
