import { useState, useEffect } from "react";
import axios from "axios";

const EdtAgrModelo = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ modelo, setModelo ] = useState({
        nombre: "",
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setModelo({
                nombre: idSeleccionado.nombre,
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setModelo({...modelo, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/modelo/modificar/${idSeleccionado.id_modelo }`, modelo
                );
                alert("Modelo actualizado con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/modelo/crear`, modelo
                );

                alert("Modelo agregado con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el registro");
        }
    };

    return (
        <div className="modal d-block">
            <div className="modal-dialog">
                
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {idSeleccionado ? "Editar modelo" : "Registrar modelo"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Digite el modelo de la motocicleta</label>

                            <input
                                type="text"
                                className="form-control"
                                name="nombre"
                                value={modelo.nombre }
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
export default EdtAgrModelo;