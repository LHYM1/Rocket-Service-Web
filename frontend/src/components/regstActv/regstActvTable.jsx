import axios from '../../axiosConfig'
// CAMBIO 1: agregar esAdmin a los props
function regstActTable ({ regstActv, setIdSeleccionado, getRegAct, esAdmin }) {

    const nombresTecnicos = {
        "5": "Juan Cortez", "6": "Miguel Valencia", "7": "Felipe Ruiz",
        "8": "Camilo Sánchez", "13": "Nicolas Benitez", "22": "Juan Pérez"
    };

    const codigosOrdenes = {
        "1": "ORD-001", "2": "ORD-002", "3": "ORD-003", "4": "ORD-004",
        "5": "ORD-005", "6": "ORD-006", "7": "ORD-007", "8": "ORD-008",
        "9": "ORD-009", "10": "ORD-010"
    };

    const estadoDisponibilidad = {
        "Disponible": "Disponible",
        "Realizando servicio": "Realizando servicio",
        "Fuera de jornada": "Fuera de jornada"
    };

    if (!regstActv || !Array.isArray(regstActv)) {
        return <p>No hay registros de actividad disponibles</p>;
    }

    const elimRegAct = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este registro de actividad?")) {
            axios.delete(`/api/registro_actividad/eliminar/${id}`)
            .then(() => { alert("Registro eliminado"); getRegAct(); })
            .catch(err => { console.error(err); alert("No se pudo eliminar"); });
        }
    };

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        {esAdmin && <th>Id</th>}
                        <th>Código registro</th>
                        <th>Orden</th>
                        <th>Técnico</th>
                        <th>Disponibilidad</th>
                        {esAdmin && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {regstActv.map((reg) => (
                        <tr key={reg.id_registro}>
                        {esAdmin && <td>{reg.id_registro}</td>}
                        <td>{reg.codigo_registro}</td>
                        <td>{codigosOrdenes[reg.id_orden] || "No definido"}</td>
                        <td>{nombresTecnicos[reg.id_usuario] || "No asignado"}</td>
                        <td>{estadoDisponibilidad[reg.estado_disponibilidad] || "por definir"}</td>
                        {esAdmin && (
                            <td>
                                <button className="btn btn-warning" onClick={() => setIdSeleccionado(reg)}>Editar</button>
                                <button className="btn btn-danger ms-2" onClick={() => elimRegAct(reg.id_registro)}>Eliminar</button>
                            </td>
                        )}
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default regstActTable;