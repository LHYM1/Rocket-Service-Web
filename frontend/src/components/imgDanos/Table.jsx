import axios from 'axios'

function TableImg ({ imgDanos, setIdSeleccionado, getImgDanos }) {
    
    const codigosOrdenes = {
        "1": "ORD-001",
        "2": "ORD-002",
        "3": "ORD-003",
        "4": "ORD-004",
        "5": "ORD-005",
        "6": "ORD-006",
        "7": "ORD-007",
        "8": "ORD-008",
        "9": "ORD-009",
        "10": "ORD-010"
    }

    if (!imgDanos || !Array.isArray(imgDanos)) {
        return <p>No hay imagenes de daños disponibles</p>;
    }

    const elimImgDanos = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar esta imagen de daño?")) {
            axios.delete(`http://localhost:4000/api/imagenes_danos/eliminar/${id}`)
            .then(() => {
                alert("Imagen de daño eliminada con éxito");
                getImgDanos();
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar la imagen");
            }); 
        } else {
            alert("La imagen no fue eliminada");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Orden</th>
                        <th>Descripción</th>
                        <th>Imagen</th>
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {imgDanos.map((img) => (
                        <tr key={img.id_imagen}>
                            <td>{img.id_imagen}</td>
                            <td>{codigosOrdenes[img.id_orden] || "No definido"}</td>      
                            <td>{img.descripcion}</td>
                            <td>{img.url_imagen}</td>
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(img)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => elimImgDanos(img.id_imagen)}
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

export default TableImg;
  
