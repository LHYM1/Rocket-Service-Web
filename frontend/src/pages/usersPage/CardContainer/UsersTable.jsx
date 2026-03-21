import axios from 'axios'

function UsersTable ({ user, setUsuarioSeleccionado, getUsuarios}) {

    const eliminar = (id) => {
        axios.delete(`http://localhost:3006/api/clasificacion_de_usuarios/eliminar/${id}`)
    
        .then(() => {
            alert("Usuario eliminado con éxito");
            getClasfUsers();
        })
        .catch(err =>  {
            console.error(err);
            alert("No se pudo eliminar el usuario");
        }); 
    }

    return (
       <div className="table-responsive">

        </div>

    )
}

export default UsersTable;
  
