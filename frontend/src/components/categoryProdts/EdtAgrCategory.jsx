import { useState, useEffect } from "react";
import axios from "../../axiosConfig";

const API_BASE_URL = "http://localhost:4000/api";
const REGEX_NOMBRE_CATEGORIA = /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9\s-]*$/;
const NOMBRE_MAX_LENGTH = 20; // Debe coincidir con el varchar(20) de la BD
const DESCRIPCION_MAX_LENGTH = 255;

// Auto-formatea el nombre igual que el módulo de modelos: mayúsculas,
// sin caracteres inválidos, sin espacios/números iniciales.
const formatearNombreAuto = (valor) => {
    let limpio = valor.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ0-9\s-]/g, "");
    limpio = limpio.replace(/^[^A-ZÁÉÍÓÚÑ]+/, "");
    limpio = limpio.replace(/\s+/g, " ");
    return limpio.slice(0, NOMBRE_MAX_LENGTH);
};

const CategoriaEditAgr = ({ idSeleccionado, onClose, onSuccess }) => {
    const [categoria, setCategoria] = useState({
        nombre: "",
        Descripcion: ""
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    // Precargar datos si es edición
    useEffect(() => {
        if (idSeleccionado) {
            setCategoria({
                nombre: idSeleccionado.nombre || "",
                Descripcion: idSeleccionado.Descripcion || ""
            });
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "nombre") {
            setCategoria(prev => ({ ...prev, nombre: formatearNombreAuto(value) }));
            setErrores(prev => ({ ...prev, nombre: undefined }));
            return;
        }

        if (name === "Descripcion") {
            setCategoria(prev => ({ ...prev, Descripcion: value.slice(0, DESCRIPCION_MAX_LENGTH) }));
            return;
        }

        setCategoria(prev => ({ ...prev, [name]: value }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        const nombreLimpio = categoria.nombre.trim();

        if (!nombreLimpio) {
            nuevosErrores.nombre = "El nombre de la categoría es obligatorio.";
        } else if (nombreLimpio.length < 2) {
            nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres.";
        } else if (nombreLimpio.length > NOMBRE_MAX_LENGTH) {
            nuevosErrores.nombre = `El nombre no puede superar los ${NOMBRE_MAX_LENGTH} caracteres.`;
        } else if (!REGEX_NOMBRE_CATEGORIA.test(nombreLimpio)) {
            nuevosErrores.nombre = "El nombre debe iniciar con una letra (ej. LUBRICANTES).";
        }

        return nuevosErrores;
    };

    const handleSave = async () => {
        const erroresValidacion = validarFormulario();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }
        setErrores({});
        setGuardando(true);

        const payload = {
            nombre: categoria.nombre.trim(),
            Descripcion: categoria.Descripcion.trim() || null
        };

        try {
            if (idSeleccionado) {
                await axios.put(
                    `${API_BASE_URL}/categoria/modificar/${idSeleccionado.id_categoria}`,
                    payload
                );
                alert("Categoría actualizada con éxito");
            } else {
                await axios.post(`${API_BASE_URL}/categoria/crear`, payload);
                alert("Categoría registrada con éxito");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar categoría:", error);
            if (error.response?.status === 409) {
                // Mensaje de duplicidad tal como lo devuelve el backend
                setErrores(prev => ({
                    ...prev,
                    nombre: error.response.data?.message || "El nombre de la categoría ya existe. Debes ingresar otro"
                }));
            } else {
                alert(error.response?.data?.message || "Hubo un error al guardar el registro.");
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fas fa-tags"></i>
                        </div>
                        <h3 className="rs-modal-title">
                            {idSeleccionado ? "Editar Categoría" : "Registrar Categoría"}
                        </h3>
                    </div>
                    <button className="rs-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    {/* Nombre de la categoría */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Nombre de la categoría <span className="rs-required">*</span>
                        </label>
                        <input
                            type="text"
                            className={`rs-input-white ${errores.nombre ? "error" : ""}`}
                            name="nombre"
                            value={categoria.nombre}
                            onChange={handleChange}
                            placeholder="Ej: LUBRICANTES"
                            maxLength={NOMBRE_MAX_LENGTH}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                            {errores.nombre
                                ? <span className="rs-error-msg">{errores.nombre}</span>
                                : <span></span>}
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                {categoria.nombre.length}/{NOMBRE_MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="rs-field">
                        <label className="rs-label">Descripción</label>
                        <textarea
                            className="rs-input-white"
                            name="Descripcion"
                            rows="4"
                            placeholder="Descripción opcional..."
                            value={categoria.Descripcion}
                            onChange={handleChange}
                        />
                        <div style={{ textAlign: "right", marginTop: "4px" }}>
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                {categoria.Descripcion.length}/{DESCRIPCION_MAX_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose} disabled={guardando}>
                        Cancelar
                    </button>
                    <button className="rs-btn rs-btn-primary" onClick={handleSave} disabled={guardando}>
                        {guardando ? "Guardando..." : (idSeleccionado ? "Actualizar" : "Guardar")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoriaEditAgr;
