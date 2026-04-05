import axios from 'axios'

// la prop product viene del padre page. Page es arreglo que muestra la tabla
// la prop setIdSeleccionado viene del padre page
// la prop getProduct viene del padre page

function TableProdts ({ product, setIdSeleccionado, getProduct }) {
    if (!product || !Array.isArray(product)) {
        return <p>No hay insumos disponibles</p>;
    }

    // constante eliminar insumo
    const eliminarIns= (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este Insumo?")) {
            axios.delete(`http://localhost:4000/api/insumos/eliminar/${id}`)
            .then(() => {
                alert("Insumo eliminado con éxito");
                getProduct(); // función que viene del padre page
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar el insumo");
            }); 
        } else {
            alert("El Insumo no fue eliminado");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Código</th>
                        <th>Categoria</th>
                        <th>Medida</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {product.map((p) => (
                        <tr key={p.id_insumo}>
                            <td>{p.id_insumo}</td>
                            <td>{p.codigo_insumo}</td>
                            <td>{p.categoria }</td> 
                            <td>{p.unidad_de_medida}</td>
                            <td>{p.nombre_insumo}</td>
                            <td>{p.precio_base}</td>
                        

                            <td>
                                <button onClick={() => setIdSeleccionado(p)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => eliminarIns(p.id_insumo)}
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

export default TableProdts;
  
