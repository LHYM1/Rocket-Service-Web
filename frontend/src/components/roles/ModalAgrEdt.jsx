import { useState, useEffect } from "react";
import axios from "axios";

const ModalEdtMod = ({ idSeleccionado, onClose, onSuccess }) => {
  const [clasfUser, setClsfUser] = useState({
    categoria_usuario: "",
  });

  // Si hay usuario seleccionado, precargar datos
  useEffect(() => {
    if (idSeleccionado) {
      setClsfUser({
        categoria_usuario: idSeleccionado.categoria_usuario,
      });
    }
  }, [idSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClsfUser({ ...clasfUser, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (idSeleccionado) {
        // Editar
        await axios.put(
          `/api/clasificacion_de_usuarios/modificar/${idSeleccionado.id_tipo_usuario}`,
          clasfUser
        );
        alert("Categoria actualizada con éxito");
      } else {
        // Agregar
        await axios.post("/api/clasificacion_de_usuarios/crear", clasfUser);
        alert("Categoria agregada con éxito");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar categoria");
    }
  };

  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {idSeleccionado ? "Editar Categoria" : "Registrar Categoria"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Categoria</label>
              <input
                type="text"
                className="form-control"
                name="categoria_usuario"
                value={clasfUser.categoria_usuario || ""}
                onChange={handleChange}
              />
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
