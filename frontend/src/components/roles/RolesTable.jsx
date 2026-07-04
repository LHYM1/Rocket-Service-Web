import axios from '../../axiosConfig'

function RolesTable ({ roles, setIdSeleccionado, getRoles}) {
    if (!roles || !Array.isArray(roles)) {
        return <p>No hay roles disponibles</p>;
    }

    const eliminarRol = (id) => {
        axios.delete(`http://localhost:4000/api/clasificacion_de_usuarios/eliminar/${id}`)
    
        .then(() => {
            alert("Rol eliminado con éxito");
            getRoles();
        })
        .catch(err =>  {
            console.error(err);
            alert("No se pudo eliminar el Rol");
        }); 
    }

    return (
        <table className="table table-hover" border="1">
            <thead className="table-light">
                <tr>
                    <th>Id</th>
                    <th>Categoria</th>
                    
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {roles.map((r) => (
                    <tr key={r.id_tipo_usuario}>
                        <td>{r.id_tipo_usuario}</td>
                        <td>{r.categoria_usuario}</td>
                       

                        <td>
                            <button onClick={() => setIdSeleccionado(r)}
                                type="button" className="btn btn-warning btn-color">
                                Editar
                            </button>

                            <button onClick={() => eliminarRol(r.id_tipo_usuario)}
                                type="button" className="btn btn-danger btn-color">
                                Eliminar
                            </button>
                        </td>
                    </tr>                    
                ))}
                
            </tbody>
        </table>

    )
}

export default RolesTable;
  
