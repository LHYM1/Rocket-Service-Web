import axios from 'axios'

function TablePrUser ({ insUsaServ, setIdSeleccionado, getInsUsServ }) {

    const nombresInsumos = {
        "1": "Alambre de cobre para bobinado",
        "2": "Manguera de Combustible Universal",
        "3": "Cable Eléctrico 18 AWG",
        "4": "Aceite de Motor 20W50",
        "5": "Pastillas de Freno Delanteras",
        "6": "Cinta Aislante Eléctrica",
        "7": "Soldadura de Estaño y Plomo 60/40",
        "8": "Líquido de Frenos DOT 4",
        "9": "Pistón Estándar",
        "10": "Retén de Aceite de Suspensión Delantera"
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


    if (!insUsaServ || !Array.isArray(insUsaServ)) {
        return <p>No hay insumos usados en servicio disponibles</p>;
    }

    const elimInsUseServ = (id) => {
        
        if (window.confirm("¿Estás seguro de eliminar este insumo de servicio?")) {
            axios.delete(`http://localhost:4000/api/insumos_usados_en_servicio/eliminar/${id}`)
            .then(() => {
                alert("Insumo de servicio eliminado con éxito");
                getInsUsServ();
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
    
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {insUsaServ.map((ts) => (
                        <tr key={ts.id_insumos_orden }>
                            <td>{ts.id_insumos_orden}</td>      
                            <td>{codigosOrdenes[ts.id_orden] || "Nod definido"}</td>
                            <td>{nombresInsumos[ts.id_insumo] || "No definido"}</td>
                            <td>{ts.cantidad}</td>
                    
                            <td>
                                <button onClick={() => setIdSeleccionado(ts)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>

                                <button onClick={() => elimInsUseServ(ts.id_insumos_orden)}
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

export default TablePrUser;
  
