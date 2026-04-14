import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgr = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ moto, setMoto ] = useState({
        placa: "",
        id_modelo: "",
        kilometraje_actual: "",
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setMoto({
                placa: idSeleccionado.placa,
                id_modelo: idSeleccionado.id_modelo, 
                kilometraje_actual: idSeleccionado.kilometraje_actual
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMoto({...moto, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/motocicleta/modificar/${idSeleccionado.id_moto}`, moto
                );
                alert("Motocicleta actualizada con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/motocicleta/crear`, moto
                );

                alert("Motocicleta agregada con éxito");
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
                            {idSeleccionado ? "Editar moto" : "Registrar moto"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Digite la placa de la moto</label>

                            <input
                                type="text"
                                className="form-control"
                                name="placa"
                                value={moto.placa }
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Modelo de Motocicleta</label>

                            <select 
                                className="form-select" 
                                name="id_modelo"
                                value={moto.id_modelo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione el modelo</option>
                                <option value="1">KTM Duke 200</option>
                                <option value="2">KTM Duke 150</option>
                                <option value="3">KTM Duke 200</option>
                                <option value="4">KTM Duke 390</option>
                                <option value="5">KTM Duke 160</option>
                                <option value="6">KTM Duke 125</option>
                                <option value="7">KTM Duke 390</option>
                                <option value="8">KTM Duke 390</option>
                                <option value="9">KTM Duke 125</option>
                                <option value="10">KTM Duke 160</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Digite el kilometraje</label>

                            <input
                                type="number"
                                className="form-control"
                                name="kilometraje_actual"
                                value={moto.kilometraje_actual}
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
export default ModalEditAgr;