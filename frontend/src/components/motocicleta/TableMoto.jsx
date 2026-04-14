import axios from 'axios'

function TableMoto ({ moto, setIdSeleccionado, getMoto }) {

    const nombresModelos = {
        "1": "KTM Duke 200",
        "2": "KTM Duke 150",
        "3": "KTM Duke 200",
        "4": "KTM Duke 390",
        "5": "KTM Duke 160",
        "6": "KTM Duke 125",
        "7": "KTM Duke 390",
        "8": "KTM Duke 390",
        "9": "KTM Duke 125",
        "10": "KTM Duke 160"
    };


    if (!moto || !Array.isArray(moto)) {
        return <p>No hay motocicletas disponibles</p>;
    }

    const elimInsUseServ = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar esta motocicleta?")) {
            axios.delete(`http://localhost:4000/api/motocicleta/eliminar/${id}`)
            .then(() => {
                alert("Motocicleta eliminada con éxito");
                getMoto();
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar la motocicleta");
            }); 
        } else {
            alert("La motocicleta no fue eliminada");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>placa</th>
                        <th>Modelo</th>
                        <th>kilometraje actual</th>
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {moto.map((mt) => (
                        <tr key={mt.id_moto}>
                            <td>{mt.placa}</td>
                            <td>{nombresModelos[mt.id_modelo] || "Modelo no definido"}</td>
                            <td>{mt.kilometraje_actual}</td>         
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(mt)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => elimInsUseServ(mt.id_moto )}
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

export default TableMoto;
  
