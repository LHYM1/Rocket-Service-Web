import axios from 'axios'

function regstActTable ({ regstActv, setIdSeleccionado, getRegAct }) {

    const nombresTecnicos = {
        "5": "Juan Cortez",
        "6": "Miguel Valencia",
        "7": "Felipe Ruiz",
        "8": "Camilo Sánchez",
        "13": "Nicolas Benitez",
        "22": "Juan Pérez"
    };

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


    if (!regstActv || !Array.isArray(regstActv)) {
        return <p>No hay registros de actividad disponibles</p>;
    }

    const elimRegAct = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este registro de actividad?")) {
            axios.delete(`http://localhost:4000/api/registro_actividad/eliminar/${id}`)
            .then(() => {
                alert("registro de actividad");
                getRegAct();
            })
            .catch(err =>  {
                console.error(err);
                alert("No se pudo eliminar el registro de actividad");
            }); 
        } else {
            alert("El iregistro de actividad");
        }
           
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Código regsitro</th>
                        <th>Orden</th>
                        <th>Técnico</th>
                        <th>disponibilidad</th>
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {regstActv.map((reg) => (
                        <tr key={reg.id_registro }>
                            <td>{reg.id_registro}</td> 
                            <td>{reg.codigo_registro}</td>
                            <td>{codigosOrdenes[reg.id_orden] || "Nod definido"}</td>
                            <td>{nombresTecnicos[reg.id_usuario ] || "No definido"}</td>
                            <td>{reg.estado_disponibilidad}</td>
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(ts)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => elimRegAct(ts.id_registro)}
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

export default regstActTable;
  
