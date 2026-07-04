import { useState, useEffect } from "react";
import axios from '../../axiosConfig';

const EditarAgrEstOrd = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ estadoOrd, setEstadoOrden ] = useState({
        nombre_estado: ""
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setEstadoOrden({
                nombre_estado: idSeleccionado.nombre_estado
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEstadoOrden({...estadoOrd, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/estado_de_orden_de_servicio/modificar/${idSeleccionado.id_estado_de_servicio }`, estadoOrd
                );
                alert("Estado de orden actualizado con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/estado_de_orden_de_servicio/crear`, estadoOrd
                );

                alert("Estado de orden agregado con éxito");
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
                            {idSeleccionado ? "Editar estado orden" : "Registrar estado orden"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Escriba el nombre del estado</label>

                            <input
                                type="text"
                                className="form-control"
                                name="nombre_estado"
                                value={estadoOrd.nombre_estado }
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
export default EditarAgrEstOrd;