import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ tipoServicio, setTipServ ] = useState({
        nombre_servicio: "",
        descripcion_servicio: "",
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setTipServ({
                nombre_servicio: idSeleccionado.nombre_servicio, 
                descripcion_servicio: idSeleccionado.descripcion_servicio,
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipServ({...tipoServicio, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/tipo_servicio/modificar/${idSeleccionado.id_tipo_servicio }`, tipoServicio
                );
                alert("Tipo de servicio actualizado con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/tipo_servicio/crear`, tipoServicio
                );

                alert("Tipo de servicio agregado con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el tipo de servicio");
        }
    };

    return (
    <div className="modal d-block">
        <div className="modal-dialog">
            
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">
                        {idSeleccionado ? "Editar tipo servicio" : "Registrar Servicio"}
                    </h5>

                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                <div className="modal-body">
                    
                    <div className="mb-3">
                        <label className="form-label">Nombre servicio</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Escribe el nombre del servicio"
                            name="nombre_servicio"
                            value={tipoServicio.nombre_servicio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Descripcion servicio</label>
                        <textarea
                            id="descripcion_servicio"
                            className="form-control"
                            name="descripcion_servicio"
                            rows="4"
                            cols="50"
                            placeholder="Describe el servicio aquí.. (Es opcional)"
                            value={tipoServicio.descripcion_servicio}
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

}
export default ModalEditAgrTs;