import axios from 'axios'

function UsersTable ({ user, setIdSeleccionado, getUsuarios}) {

    const eliminarUsuario = async (id) => {

        const confirmar = window.confirm("¿Deseas desactivar este usuario?");

        if (!confirmar) return;

        try {
            await axios.put(`http://localhost:4000/api/usuarios/eliminar/${id}`);
            alert("Usuario desactivado con éxito");
            getUsuarios();
        } catch (err) {
            console.error(err);
            alert("Error al desactivar el usuario");
        }
    }

    const restaurarUsuario = async (id) => {

        const confirmar = window.confirm("¿Deseas activar este usuario?");
        if (!confirmar) return;

        try {
            await axios.put(`http://localhost:4000/api/usuarios/restaurar/${id}`);
            alert("Usuario activado con éxito");
            getUsuarios();
        } catch (err) {
            console.error(err);
            alert("Error al activar el usuario");
        }
    };

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
                {/* Concatenación de nombre y apellido */}
                {/* El campo nombre_completo viene de la consulta db */ }
                { /* categoria_usuario es el nombre de la categoria que viene del join */}
                {user.map((u) => (
                    <tr key={u.id_usuario}>
                        <td>{u.id_usuario}</td>
                        <td>{u.nombre}</td> 
                        <td>{u.apellido}</td>
                        <td>{u.correo_usuario}</td>
                        <td>{u.telefono_usuario}</td>
                        <td>{u.categoria_usuario}</td> 
                        
                        <td>
                            <button onClick={() => setIdSeleccionado(u)}
                                type="button" className="btn btn-warning btn-color">
                                Editar
                            </button>

                            {u.estado === 1 ? (
                                <button 
                                    onClick={() => eliminarUsuario(u.id_usuario)}
                                    className="btn btn-danger btn-color"
                                >
                                    Desactivar
                                </button>
                            ) : (
                                <button 
                                    onClick={() => restaurarUsuario(u.id_usuario)}
                                    className="btn btn-success btn-color"
                                >
                                    Activar
                                </button>
                            )}
                        </td>
                    </tr>                    
                ))}
                
            </tbody>
        </table>

    )
}

export default UsersTable;
  
