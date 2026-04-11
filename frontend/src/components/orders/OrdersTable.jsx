import axios from 'axios'

function OrdenesTable ({ ordenes, setIdSeleccionado, getOrdenes }) {
    // Cambiamos la validación para que coincida con el nuevo nombre de prop
    if (!ordenes || !Array.isArray(ordenes)) {
        return <p className="text-center">No hay órdenes de servicio disponibles</p>;
    }

    const placaMoto = {
        "1": "COZ 89B",
        "2": "YHT 87U",
        "3": "ETY 45P",
        "4": "URT 48M",
        "5": "LRT 64K",
        "6": "MNQ 90D",
        "7": "ABC 01E",
        "8": "DEF 02F",
        "9": "GHI 03G",
        "10": "JKL 04H",
        "11": "IJK 89H"
    }

    const nombresClientes = {
        "1": "Juan Pérez",
        "2": "Carlos Castañeda",
        "3": "Luis Suarez",
        "4": "Andrés Órtiz",
        "9": "Armando Espinoza",
        "10": "José Garcia",
        "11": "Alberto Huertas",
        "12": "Tomas Alba",
        "16": "Carlos Perez",
        "19": "Juan Huertas"
    };

    const nombresTecnicos = {
        "5": "Juan Cortez",
        "6": "Miguel Valencia",
        "7": "Felipe Ruiz",
        "8": "Camilo Sánchez",
        "13": "Nicolas Benitez",
        "22": "Juan Pérez"
    };

    const nombresServicios = {
        "1": "Mantenimiento preventivo",
        "2": "Diagnóstico",
        "3": "Reparación",
        "4": "Ajuste de Válvulas y Carburación",
        "5": "Diagnóstico y Reparación de Suspensión",
        "6": "Mantenimiento del Sistema de Frenos",
        "7": "Revisión y carga de batería",
        "8": "Instalación de Sistemas de Escape",
        "9": "Alineación y Balanceo de Ruedas",
        "10": "Limpieza Ultrasónica de Componentes",
        "13": "mantenimiento"
    };

    const estadosOrden = {
        "1": "ASIGNADA",
        "2": "PENDIENTE", 
        "3": "FINALIZADA",
        "4": "CANCELADA", 
        "5": "EN PROCESO", 
        "6": "EN ESPERA",
        "7": "RECHAZADA",
        "8": "EN REVISIÓN",
        "9": "APROBADA",
        "10": "FACTURADA"
    };

    

    const eliminarOrden = (id, codigo) => {
        if (window.confirm(`¿Estás seguro de eliminar la orden ${codigo}?`)) {
            axios.delete(`http://localhost:4000/api/ordenes_de_servicio/eliminar/${id}`)
            .then(() => {
                alert("Orden eliminada con éxito");
                getOrdenes(); // Refresca la lista
            })
            .catch(err => {
                console.error(err);
                alert("No se pudo eliminar la orden. Verifique la conexión con el servidor.");
            }); 
        }
    }

    return (
        <div className="card shadow-sm border-0">
            <div className="card-body">

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        
                        <thead className="table-dark text-center">
                            <tr>
                                <th>ID</th>
                                <th>Código</th>
                                <th>Placa</th>
                                <th>Cliente</th>
                                <th>Técnico</th>
                                <th>Problema</th>
                                <th>Estado</th>
                                <th>Servicio</th>
                                <th>Creación</th>
                                <th>Finalización</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ordenes.map((o) => (
                                <tr key={o.id_orden}>
                                    <td>{o.id_orden}</td>

                                    <td>
                                        <span className="fw-bold text-primary">
                                            {o.codigo_orden}
                                        </span>
                                    </td>

                                    <td>{placaMoto[o.id_moto] || "No definida"} </td>
                                    <td>{nombresClientes[o.id_usuario] || "No definido"}</td>
                                    <td>{nombresTecnicos[o.id_tecnico_asignado] || "No definido"}</td>

                                    {/* Problema recortado */}
                                    <td style={{ maxWidth: "150px" }}>
                                        <span className="text-truncate d-inline-block w-100">
                                            {o.descripcion_del_problema}
                                        </span>
                                    </td>

                                    {/*  Estado con badge */}
                                    <td>{estadosOrden[o.id_estado_de_servicio ] || "No definido"}</td>

                                    <td>{nombresServicios[o.id_tipo_servicio] || "No definidos"}</td>

                                    <td>
                                        {new Date(o.fecha_de_creacion).toLocaleDateString()}
                                    </td>

                                    <td>
                                        {o.fecha_finalizacion_estimada
                                            ? new Date(o.fecha_finalizacion_estimada).toLocaleDateString()
                                            : <span className="text-muted">—</span>
                                        }
                                    </td>

                                    {/* Botones mejorados */}
                                    <td className="text-center">
                                        <button 
                                            onClick={() => setIdSeleccionado(o)}
                                            className="btn btn-outline-warning btn-sm me-2"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>

                                        <button 
                                            onClick={() => eliminarOrden(o.id_orden, o.codigo_orden)}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

export default OrdenesTable;