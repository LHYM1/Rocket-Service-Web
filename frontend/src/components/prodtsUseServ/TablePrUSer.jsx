import axios from '../../axiosConfig'

function TablePrUSer ({ insUsaServ, setIdSeleccionado, getInsUsServ, esAdmin }) {

    if (!insUsaServ || !Array.isArray(insUsaServ)) {
        return <p>No hay insumos usados en servicio disponibles</p>;
    }

    const elimInsUseServ = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este insumo de servicio?")) {
            axios.delete(`/api/insumos_usados_en_servicio/eliminar/${id}`)
            .then(() => {
                alert("Insumo de servicio eliminado con éxito");
                getInsUsServ();
            })
            .catch(err => {
                console.error(err);
                alert("No se pudo eliminar el insumo de servicio");
            });
        }
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        {esAdmin && <th>Id</th>}
                        <th>Orden</th>
                        <th>Insumo</th>
                        <th>Cantidad</th>
                        {esAdmin && <th>Acciones</th>}
                    </tr>
                </thead>

                <tbody>
                    {insUsaServ.map((ts) => (
                        <tr key={ts.id_insumos_orden}>
                            {esAdmin && <td>{ts.id_insumos_orden}</td>}
                            <td>ORD-{String(ts.id_orden).padStart(3, "0")}</td>
                            <td>{ts.nombre_insumo || "No definido"}</td>
                            <td>{ts.cantidad} {ts.nombre_unidad || ""}</td>

                            {esAdmin && (
                                <td>
                                    <button onClick={() => setIdSeleccionado(ts)}
                                        type="button" className="btn btn-warning btn-sm me-1">
                                        Editar
                                    </button>
                                    <button onClick={() => elimInsUseServ(ts.id_insumos_orden)}
                                        type="button" className="btn btn-danger btn-sm">
                                        Eliminar
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TablePrUSer;