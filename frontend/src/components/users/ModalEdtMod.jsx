import { useState, useEffect } from "react";
import axios from "axios";

const ModalEdtMod = ({ idSeleccionado, onClose, onSuccess }) => {
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    correo_usuario: "",
    telefono_usuario: "",
    clasificacion_de_usuarios: ""
  });

  // Si hay usuario seleccionado, precargar datos
  useEffect(() => {
    if (idSeleccionado) {
      setUsuario({
        nombre: idSeleccionado.nombre,
        apellido: idSeleccionado.apellido,
        correo_usuario: idSeleccionado.correo_usuario,
        telefono_usuario: idSeleccionado.telefono_usuario,
        clasificacion_de_usuarios: idSeleccionado.clasificacion_de_usuarios || ""
      });
    }
  }, [idSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (idSeleccionado) {
        // Editar
        await axios.put(
          `http://localhost:4000/api/usuarios/modificar/${idSeleccionado.id_usuario}`,
          usuario
        );
        alert("Usuario actualizado con éxito");
      } else {
        // Agregar
        await axios.post("http://localhost:4000/api/usuarios/crear", usuario);
        alert("Usuario agregado con éxito");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el usuario");
    }
  };

  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {idSeleccionado ? "Editar Usuario" : "Registrar Usuario"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={usuario.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control"
                name="apellido"
                value={usuario.apellido}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                name="correo_usuario"
                value={usuario.correo_usuario}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-control"
                name="telefono_usuario"
                value={usuario.telefono_usuario}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Tipo de Usuario</label>

              <select
                className="form-select"
                name="id_tipo_usuario"
                value={usuario.id_tipo_usuario}
                onChange={handleChange}
              >
                <option value="">Seleccione la categoria del usuario</option>

                { /* filtrando nombre de categoria de usuario */ }
                {ciudades.map((catUser) => (
                  <option key={catUser.id_tipo_usuario} value={catUser.id_tipo_usuario}>
                    {catUser.categoria_usuario} 
                  </option>
                ))} 
              </select>

            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {idSeleccionado ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEdtMod;
