import axios from '../../axiosConfig'

function TableMoto ({ moto, setIdSeleccionado, getMoto }) {

    if (!moto || !Array.isArray(moto)) {
        return <p>No hay motocicletas disponibles</p>;
    }

    const eliminarMoto = (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta motocicleta?")) {
            axios.delete(`http://localhost:4000/api/motocicleta/eliminar/${id}`)
            .then(() => { alert("Motocicleta eliminada con éxito"); getMoto(); })
            .catch(err => { console.error(err); alert("No se pudo eliminar la motocicleta"); });
        } else {
            alert("La motocicleta no fue eliminada");
        }
    }

    return (
        <div>
            <table className="table table-hover" border="1">
                <thead className="table-light">
                    <tr>
                        <th>Placa</th>
                        <th>Dueño</th>
                        <th>Modelo</th>
                        <th>Kilometraje actual</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {moto.map((mt) => (
                        <tr key={mt.id_moto}>
                            <td>{mt.placa}</td>
                            <td>{mt.nombre_usuario} {mt.apellido_usuario}</td>
                            <td>{mt.nombre_modelo || "Sin modelo"}</td>
                            <td>{mt.kilometraje_actual}</td>
                            <td>
                                <button onClick={() => setIdSeleccionado(mt)}
                                    type="button" className="btn btn-warning btn-color">
                                    Editar
                                </button>
                                <button onClick={() => eliminarMoto(mt.id_moto)}
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