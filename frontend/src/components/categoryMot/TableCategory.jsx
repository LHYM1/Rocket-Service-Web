import axios from '../../axiosConfig'

function tableCategoriaProd ({ categoria, setIdSeleccionado, getCategoria }) {

    if (!categoria || !Array.isArray(categoria)) {
        return <p>No hay categorias disponibles</p>;
    }

    const eliminarCatg = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar esta categoria?")) {
            axios.delete(`http://localhost:4000/api/categoria/eliminar/${id}`)
            .then(() => {
                alert("Categoria insumo eliminada con éxito");
                getCategoria();
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar la categoria");
            }); 
        } else {
            alert("La categoria no fue eliminada");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>nombre</th>
                        <th>Descripcion</th>
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {categoria.map((cat) => (
                        <tr key={cat.id_categoria}>
                            <td>{cat.nombre}</td>
                            <td>{cat.Descripcion}</td>         
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(cat)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => eliminarCatg(cat.id_categoria )}
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

export default tableCategoriaProd;
  
