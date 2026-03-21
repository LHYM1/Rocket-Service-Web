import axios from 'axios'

function UsersTable ({ user, setUsuarioSeleccionado, getUsuarios}) {

    const eliminarUsuario = (id) => {
        axios.delete(`http://localhost:3006/api/clasificacion_de_usuarios/eliminar/${id}`)
    
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
        <table border="1">
            <thead>
                <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {user.map((u) => (
                <tr key={u.id_usuario}>
                    <td>{u.codigo_usuario}</td>
                    <td>{u.nombre}</td>
                    <td>{u.apellido}</td>
                    <td>{u.correo_usuario}</td>
                    <td>{u.telefono_usuario}</td>

                    <td>
                    <button onClick={() => setUsuarioSeleccionado(u)}>
                        Editar
                    </button>

                    <button onClick={() => eliminarUsuario(u.id_usuario)}>
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
  
