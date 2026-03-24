import axios from 'axios'

function UsersTable ({ user, setIdSeleccionado, getUsuarios}) {

    const eliminarUsuario = (id) => {
        axios.delete(`http://localhost:4000/api/usuarios/eliminar/${id}`)
    
        .then(() => {
            alert("Usuario eliminado con éxito");
            getUsuarios();
        })
        .catch(err =>  {
            console.error(err);
            alert("No se pudo eliminar el usuario");
        }); 
    }

    return (
        <table className="table table-hover" border="1">
            <thead className="table-light">
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Categoria</th>
                    
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {user.map((u) => (
                    <tr key={u.id_usuario}>
                        <td>{u.id_usuario}</td>
                        <td>{u.nombre}</td>
                        <td>{u.apellido}</td>
                        <td>{u.correo_usuario}</td>
                        <td>{u.telefono_usuario}</td>
                        <td>{u.clasificacion_de_usuarios}</td>

                        <td>
                            <button onClick={() => setIdSeleccionado(u)}
                                type="button" className="btn btn-warning btn-color">
                                Editar
                            </button>

                            <button onClick={() => eliminarUsuario(u.id_usuario)}
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

export default UsersTable;
  
