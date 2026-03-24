import {useState} from 'react';
import axios from 'axios';

function DeleteModal ({usuario}) {
    const eliminarUsuario = () => {
        axios.delete(`http://localhost:4000/api/usuarios/eliminar/${usuario.id_usuario}`)
        .then((response) => {
            console.log(response.data);
            // Aquí puedes agregar lógica para actualizar la lista de usuarios después de eliminar
        })
        .catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className="modal-delele">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Eliminar Usuario</h5>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>

            </div>
            <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar a {usuario.nombre} {usuario.apellido}?</p>  
            </div>
        </div>
    );
}

export default DeleteModal;
