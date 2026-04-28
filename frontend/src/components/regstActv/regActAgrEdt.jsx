import { useState, useEffect } from "react";
import axios from "axios";

const RegActAgrEdt = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ regstActv, setRegAct ] = useState({
        codigo_registro: "",
        id_orden: "",
        id_usuario: "",
        estado_disponibilidad: ""
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setRegAct({
                codigo_registro: idSeleccionado.codigo_registro, 
                id_orden: idSeleccionado.id_orden,
                id_usuario: idSeleccionado.id_usuario,
                estado_disponibilidad: idSeleccionado.estado_disponibilidad
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegAct({...regstActv, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/registro_actividad/modificar/${idSeleccionado.id_registro  }`, regstActv
                );
                alert("Registro de actividad actualizado con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/registro_actividad/crear`, regstActv
                );

                alert("Registro de actividad agregado con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el registro de actividad");
        }
    };

    return (
        <div className="modal d-block">
            <div className="modal-dialog">
                
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {idSeleccionado ? "Editar registro de actividad" : "Registrar registro de actividad"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Código</label>

                        <input
                            type="text"
                            className="form-control"
                            name="codigo_registro"
                            value={regstActv.codigo_registro}
                            onChange={handleChange} disabled={!!idSeleccionado}
                        />
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Orden</label>
                                <select
                                    className="form-control"
                                    name="id_orden" // Este es el nombre que recibirá el ID
                                    value={regstActv.id_orden}
                                    onChange={handleChange} disabled={!!idSeleccionado}
                                >
                                    <option value=""></option>
                                    <option value="1">ORD-001</option>
                                    <option value="2">ORD-002</option>
                                    <option value="3">ORD-003</option>
                                    <option value="4">ORD-004</option>
                                    <option value="5">ORD-005</option>
                                    <option value="6">ORD-006</option>
                                    <option value="7">ORD-007</option>
                                    <option value="8">ORD-008</option>
                                    <option value="9">ORD-009</option>
                                    <option value="10">ORD-010</option>
                                </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Técnico Asignado</label>

                            <select
                                className="form-control"
                                name="id_usuario" // Este es el nombre que recibirá el ID
                                value={regstActv.id_usuario }
                                onChange={handleChange}
                            >

                                <option value="">Seleccione un técnico</option>
                                <option value="5">Juan Cortez</option>
                                <option value="6">Miguel Valencia</option>
                                <option value="7">Felipe Ruiz</option>
                                <option value="8">Camilo Sánchez</option>
                                <option value="13">Nicolas Benitez</option>
                                <option value="22">Juan Pérez</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Estado disponibilidad</label>

                            <select
                                className="form-control"
                                name="estado_disponibilidad" // Este es el nombre que recibirá el ID
                                value={regstActv.estado_disponibilidad }
                                onChange={handleChange} disabled={!!idSeleccionado}
                            >

                                <option value="">Seleccione un estado</option>
                                <option value="Disponible">Disponible</option>
                                <option value="Fuera de jornada">Fuera de jornada</option>
                                <option value="Realizando servicio">Realizando servicio</option>
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

}
export default RegActAgrEdt;