import { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { useToast } from "../../context/ToastContext";

const EdtAgrModelo = ({ idSeleccionado, onClose, onSuccess }) => {
    const { mostrarToast } = useToast();

    const [modelo, setModelo] = useState({ nombre: "" });
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (idSeleccionado) {
            setModelo({ nombre: idSeleccionado.nombre });
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setModelo({ ...modelo, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: "" });
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!modelo.nombre.trim()) {
            nuevosErrores.nombre = "El nombre del modelo es obligatorio.";
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSave = async () => {
        if (!validar()) return;

        try {
            setCargando(true);
            if (idSeleccionado) {
                await axios.put(
                    `/api/modelo/modificar/${idSeleccionado.id_modelo}`, modelo
                );
                mostrarToast("Modelo de motocicleta actualizado satisfactoriamente.", "success");
            } else {
                await axios.post(`/api/modelo/crear`, modelo);
                mostrarToast("Modelo de motocicleta registrado exitosamente.", "success");
            }
            onSuccess();
            onClose();
        } catch (error) {
            const msg = error.response?.data?.message || "Hubo un error al guardar el modelo.";
            mostrarToast(msg, "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal rs-modal-white">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-motorcycle"></i>
                        </div>
                        <h5 className="rs-modal-title">
                            {idSeleccionado ? "Editar Modelo" : "Registrar Modelo"}
                        </h5>
                    </div>
                    <button className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-field">
                        <label className="rs-label" htmlFor="modelo-nombre">
                            Nombre del modelo <span className="rs-required">*</span>
                        </label>
                        <input
                            id="modelo-nombre"
                            type="text"
                            className={`rs-input-white ${errores.nombre ? 'error' : ''}`}
                            name="nombre"
                            value={modelo.nombre}
                            onChange={handleChange}
                            placeholder="Ej: KTM Duke 200"
                        />
                        {errores.nombre && (
                            <span className="rs-error-msg">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {errores.nombre}
                            </span>
                        )}
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="rs-btn rs-btn-primary" onClick={handleSave} disabled={cargando}>
                        {cargando
                            ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</>
                            : <><i className={`fa-solid ${idSeleccionado ? 'fa-pen' : 'fa-plus'}`}></i>
                                {idSeleccionado ? " Actualizar" : " Guardar"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EdtAgrModelo;