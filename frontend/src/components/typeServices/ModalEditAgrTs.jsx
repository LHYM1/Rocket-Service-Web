import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const [cargando, setCargando] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [tipoServicio, setTipServ] = useState({
        nombre_servicio: "",
        descripcion_servicio: ""
    });

    useEffect(() => {
        if (idSeleccionado) {
            setTipServ({
                nombre_servicio: idSeleccionado.nombre_servicio || "", 
                descripcion_servicio: idSeleccionado.descripcion_servicio || ""
            });
        } else {
            setTipServ({
                nombre_servicio: "",
                descripcion_servicio: ""
            });
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "nombre_servicio") {
            const textoFormateado = value.toUpperCase().replace(/\s+/g, ' ');
            setTipServ({ ...tipoServicio, [name]: textoFormateado });
            setErrorMsg("");
        } else {
            setTipServ({ ...tipoServicio, [name]: value });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const nombreFinal = tipoServicio.nombre_servicio.trim();

        if (!nombreFinal) {
            setErrorMsg("EL NOMBRE DEL SERVICIO ES REQUERIDO");
            return;
        }

        const payload = {
            ...tipoServicio,
            nombre_servicio: nombreFinal
        };

        setCargando(true);
        try {
            if (idSeleccionado) {
                const res = await axios.put(
                    `http://localhost:4000/api/tipo_servicio/modificar/${idSeleccionado.id_tipo_servicio}`, 
                    payload
                );
                alert(res.data.message || "Tipo de servicio actualizado correctamente");
            } else {
                const res = await axios.post(`http://localhost:4000/api/tipo_servicio/crear`, payload);
                alert(res.data.message || "Tipo de servicio creado correctamente");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            const msg = error.response?.data?.message || "Ocurrió un error al procesar la solicitud";
            alert(msg);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className={`fa-solid ${idSeleccionado ? "fa-pen-to-square" : "fa-plus"}`}></i>
                        </div>
                        <h3 className="rs-modal-title">
                            {idSeleccionado ? "Editar Tipo de Servicio" : "Registrar Servicio"}
                        </h3>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSave}>
                    <div className="rs-modal-body">
                        <div className="rs-field">
                            <label className="rs-label">
                                Nombre del Servicio <span className="rs-required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`rs-input-white ${errorMsg ? "error" : ""}`}
                                placeholder="EJ: CAMBIO DE ACEITE Y FILTRO"
                                name="nombre_servicio"
                                value={tipoServicio.nombre_servicio}
                                onChange={handleChange}
                            />
                            {errorMsg && (
                                <span className="rs-error-msg">
                                    <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
                                </span>
                            )}
                        </div>

                        <div className="rs-field">
                            <label className="rs-label">Descripción</label>
                            <textarea
                                className="rs-input-white"
                                name="descripcion_servicio"
                                rows="3"
                                placeholder="Describe el alcance del servicio... (Opcional)"
                                value={tipoServicio.descripcion_servicio}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="rs-modal-footer">
                        <button 
                            type="button" 
                            className="rs-btn rs-btn-secondary" 
                            onClick={onClose} 
                            disabled={cargando}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="rs-btn rs-btn-primary" 
                            disabled={cargando}
                        >
                            {cargando ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fa-solid fa-floppy-disk"></i> {idSeleccionado ? "Actualizar" : "Guardar"}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalEditAgrTs;