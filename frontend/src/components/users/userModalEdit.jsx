import {useState} from 'react';
import axios from 'axios';
import App from './src/App.jsx';

function UserModalEdit () {
    const [ nombre, setNombre ] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [ telefono, setTelefono ] = useState("");
  
    const editarUsuario = (usuario) => {
        setNombre(usuario.nombre);
        setApellido(usuario.apellido);
        setCorreo(usuario.correo_usuario);
        setTelefono(usuario.telefono);
    };
    return (
        <div className="modal fade" id="modalEditar">
            <div className="modal-dialog">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Editar Usuario</h5>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div className="modal-body">

                        <input
                        type="text"
                        className="form-control mb-2"
                        value={nombre}
                        onChange={(e)=>setNombre(e.target.value)}
                        placeholder="Nombre"
                        />

                        <input
                        type="text"
                        className="form-control mb-2"
                        value={apellido}
                        onChange={(e)=>setApellido(e.target.value)}
                        placeholder="Apellido"
                        />

                        <input
                        type="email"
                        className="form-control"
                        value={correo}
                        onChange={(e)=>setCorreo(e.target.value)}
                        placeholder="Correo"
                        />

                        <input
                        type="text"
                        className="form-control"
                        value={telefono}
                        onChange={(e)=>setTelefono(e.target.value)}
                        placeholder="Teléfono"
                        />

                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" data-bs-dismiss="modal">
                        Cancelar
                        </button>

                        <button className="btn btn-primary" onClick={editarUsuario}>
                        Guardar cambios
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );

}

export default UserModalEdit;