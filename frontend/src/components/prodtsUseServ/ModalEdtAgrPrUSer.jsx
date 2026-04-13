import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ insUsServicio, setInsUsServ ] = useState({
        id_orden: "",
        id_insumo: "",
        cantidad: "",
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setInsUsServ({
                id_orden: idSeleccionado.id_orden,
                id_insumo: idSeleccionado.id_insumo, 
                cantidad: idSeleccionado.cantidad
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInsUsServ({...insUsServicio, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/insumos_usados_en_servicio/modificar/${idSeleccionado.id_insumos_orden  }`, insUsServicio
                );
                alert("Insumo usado en servicio actualizado con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/insumos_usados_en_servicio/crear`, insUsServicio
                );

                alert("Insumo usado en servicio agregado con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el insumo usado en servicio");
        }
    };

    return (
        <div className="modal d-block">
            <div className="modal-dialog">
                
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {idSeleccionado ? "Editar insumo usado en servicio" : "Registrar insumo usado servicio"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Orden</label>
                                <select
                                    className="form-control"
                                    name="id_orden" // Este es el nombre que recibirá el ID
                                    value={insUsServicio.id_orden}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione la orden</option>
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

                        <div className="mb-3">
                            <label className="form-label">Insumo</label>
                                <select
                                    className="form-control"
                                    name="id_insumo" // Este es el nombre que recibirá el ID
                                    value={insUsServicio.id_insumo}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione un insumo</option>
                                    <option value="1">Alambre de cobre para bobinado</option>
                                    <option value="2">Manguera de Combustible Universal</option>
                                    <option value="3">Cable Eléctrico 18 AWG</option>
                                    <option value="4">Aceite de Motor 20W50</option>
                                    <option value="5">Pastillas de Freno Delanteras</option>
                                    <option value="6">Cinta Aislante Eléctrica</option>
                                    <option value="7">Soldadura de Estaño y Plomo 60/40</option>
                                    <option value="8">Líquido de Frenos DOT 4</option>
                                    <option value="9">Pistón Estándar</option>
                                    <option value="10">Retén de Aceite de Suspensión Delantera</option>
                                </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Digite la cantidad utilizada</label>

                            <input
                                type="number"
                                className="form-control"
                                name="cantidad"
                                value={insUsServicio.cantidad }
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