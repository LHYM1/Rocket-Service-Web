import { useState } from 'react';
import axios from 'axios';

// Modal para agregar un nuevo usuario
const ModalUserAgr = ({ onClose, onSuccess }) => {
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    correo_usuario: '',
    telefono_usuario: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({ ...nuevoUsuario, [name]: value });
  };

  const handleAddUsuario = async () => {
    try {
      await axios.post("http://localhost:4000/api/usuarios/crear", nuevoUsuario);
      onSuccess(); // Refresca la tabla en el componente padre
      onClose();   // Cierra el modal
    } catch (error) {
      console.error("Error al agregar:", error);
      alert("Hubo un error al guardar el usuario");
    }
  };

  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Registrar usuarios</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input type="text" className="form-control" name="nombre" onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input type="text" className="form-control" name="apellido" onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control" name="correo_usuario" onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Teléfono</label>
              <input type="text" className="form-control" name="telefono_usuario" onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Tipo de Usuario</label>
              <select className="form-select" name="clasificacion_de_usuarios" onChange={handleChange}>
              </select>
            </div>

          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleAddUsuario}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalUserAgr;