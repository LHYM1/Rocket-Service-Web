import { useState, useEffect, useRef } from "react";
import axios from "../../axiosConfig";

const API_BASE_URL = "/api";

const REGEX_PLACA_COMPLETA = /^[A-Z]{3}\s?[0-9]{2}[A-Z]$/;
const REGEX_NOMBRE_MODELO = /^[A-ZÁÉÍÓÚÑ]+[A-Z0-9ÁÉÍÓÚÑ\s-]*$/;
const KM_MAXIMO_PERMITIDO = 1000000;

const ModalEditAgr = ({ idSeleccionado, onClose, onSuccess }) => {
    const [moto, setMoto] = useState({
        placa: "",
        id_modelo: "",
        kilometraje_actual: "",
        id_usuario: ""
    });

    const [usuarios, setUsuarios] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [errores, setErrores] = useState({});
    const [buscandoPlaca, setBuscandoPlaca] = useState(false);
    
    // Estado para controlar la alerta de "Placa ya registrada"
    const [placaExiste, setPlacaExiste] = useState(false);

    // Referencia para no repetir la consulta HTTP si la placa no ha cambiado
    const ultimaPlacaBuscada = useRef("");

    // Formulario Inline de Modelo
    const [mostrarFormModelo, setMostrarFormModelo] = useState(false);
    const [modoModelo, setModoModelo] = useState("crear");
    const [inputModelo, setInputModelo] = useState("");
    const [errorModelo, setErrorModelo] = useState("");

    // Formatear Placa Auto-Insertando Espacio
    const formatearPlacaAuto = (valor) => {
        let limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (limpio.length > 6) limpio = limpio.slice(0, 6);
        if (limpio.length > 3) {
            return `${limpio.slice(0, 3)} ${limpio.slice(3)}`;
        }
        return limpio;
    };

    // Formateador Entero Sin Decimales
    const formatearNumeroConPuntos = (val) => {
        if (!val && val !== 0) return "";
        const soloNum = String(val).replace(/\D/g, "");
        if (!soloNum) return "";
        return parseInt(soloNum, 10).toLocaleString("es-CO");
    };

    const formatearModeloAut = (valor) => {
        let limpio = valor.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ0-9\s-]/g, "");
        limpio = limpio.replace(/^[0-9]+/, "");
        limpio = limpio.replace(/([A-ZÁÉÍÓÚÑ])([0-9])/g, "$1 $2");
        limpio = limpio.replace(/([0-9])([A-ZÁÉÍÓÚÑ])/g, "$1 $2");
        limpio = limpio.replace(/\s+/g, " ");
        return limpio;
    };

    const cargarModelos = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/modelo/listar`);
            const dataExtraida = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setModelos(dataExtraida);
            return dataExtraida;
        } catch (err) {
            console.error("Error al cargar modelos:", err);
            return [];
        }
    };

    // Cargar Usuarios Normalizados
    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const endpoint = idSeleccionado
                    ? `${API_BASE_URL}/usuarios/listar`
                    : `${API_BASE_URL}/motocicleta/sin-moto`;

                const res = await axios.get(endpoint);

                let rawData = [];
                if (Array.isArray(res.data)) {
                    rawData = res.data;
                } else if (Array.isArray(res.data?.data)) {
                    rawData = res.data.data;
                } else if (Array.isArray(res.data?.usuarios)) {
                    rawData = res.data.usuarios;
                }

                let listaFormateada = rawData.map(u => {
                    const id = u.id_usuario ?? u.id ?? u.ID;
                    const nombre = u.nombre_usuario || u.nombre || u.nombres || u.nombre_cliente || "";
                    const apellido = u.apellido_usuario || u.apellido || u.apellidos || u.apellido_cliente || "";
                    const nombreCompleto = `${nombre} ${apellido}`.trim() || `Usuario #${id}`;

                    return { id_usuario: id, nombreCompleto };
                });

                if (idSeleccionado && idSeleccionado.id_usuario) {
                    const idActual = Number(idSeleccionado.id_usuario);
                    const existeDueno = listaFormateada.some(u => Number(u.id_usuario) === idActual);

                    if (!existeDueno) {
                        const nombreEdicion = `${idSeleccionado.nombre_usuario || idSeleccionado.nombre || ""} ${idSeleccionado.apellido_usuario || idSeleccionado.apellido || ""}`.trim() || `Cliente Actual (#${idActual})`;
                        listaFormateada.unshift({
                            id_usuario: idActual,
                            nombreCompleto: nombreEdicion
                        });
                    }
                }

                setUsuarios(listaFormateada);
            } catch (err) {
                console.error("Error al cargar clientes:", err.response?.data || err.message);
            }
        };

        cargarUsuarios();
        cargarModelos();
    }, [idSeleccionado]);

    // Pre-cargar datos si es edición
    useEffect(() => {
        if (idSeleccionado) {
            setMoto({
                placa: idSeleccionado.placa || "",
                id_modelo: idSeleccionado.id_modelo || "",
                kilometraje_actual: idSeleccionado.kilometraje_actual !== undefined ? String(Math.trunc(idSeleccionado.kilometraje_actual)) : "",
                id_usuario: idSeleccionado.id_usuario || ""
            });
            setPlacaExiste(false);
            ultimaPlacaBuscada.current = idSeleccionado.placa || "";
        }
    }, [idSeleccionado]);

    // Buscar Automáticamente y determinar si la placa ya existe
    const buscarDatosPorPlaca = async (placaCompleta) => {
        if (idSeleccionado || !REGEX_PLACA_COMPLETA.test(placaCompleta)) return;
        if (ultimaPlacaBuscada.current === placaCompleta) return;

        try {
            setBuscandoPlaca(true);
            ultimaPlacaBuscada.current = placaCompleta;

            // Limpiamos errores de validación previos sobre la placa
            setErrores(prev => ({ ...prev, placa: undefined }));

            const res = await axios.get(`${API_BASE_URL}/motocicleta/placa/${encodeURIComponent(placaCompleta)}`);
            const dataMoto = res.data?.data || res.data?.motocicleta || res.data;

            if (dataMoto && (dataMoto.id_moto || dataMoto.placa || dataMoto.id)) {
                setPlacaExiste(true);
                setMoto(prev => ({
                    ...prev,
                    id_modelo: dataMoto.id_modelo || prev.id_modelo,
                    id_usuario: dataMoto.id_usuario || prev.id_usuario,
                    kilometraje_actual: dataMoto.kilometraje_actual !== undefined && dataMoto.kilometraje_actual !== null
                        ? String(Math.trunc(dataMoto.kilometraje_actual))
                        : prev.kilometraje_actual
                }));
            } else {
                setPlacaExiste(false);
            }
        } catch (error) {
            // Si retorna 404 significa que la placa está libre
            setPlacaExiste(false);
        } finally {
            setBuscandoPlaca(false);
        }
    };

    // Validaciones Integrales
    const validarFormularioMoto = () => {
        const nuevosErrores = {};
        const placaLimpia = moto.placa.trim().toUpperCase();

        if (!placaLimpia) {
            nuevosErrores.placa = "La placa es obligatoria";
        } else if (!REGEX_PLACA_COMPLETA.test(placaLimpia)) {
            nuevosErrores.placa = "Formato inválido. Debe terminar en letra (Ej. WUS 28U)";
        } else if (!idSeleccionado && placaExiste) {
            nuevosErrores.placa = "La motocicleta con esta placa ya se encuentra registrada.";
        }

        if (!moto.id_modelo) {
            nuevosErrores.id_modelo = "Seleccione un modelo válido";
        }

        const km = Number(moto.kilometraje_actual);
        if (moto.kilometraje_actual === "" || moto.kilometraje_actual === null) {
            nuevosErrores.kilometraje_actual = "El kilometraje es obligatorio";
        } else if (isNaN(km) || km <= 0) {
            nuevosErrores.kilometraje_actual = "El kilometraje debe ser mayor a 0 KM";
        } else if (km > KM_MAXIMO_PERMITIDO) {
            nuevosErrores.kilometraje_actual = `El kilometraje no puede superar ${KM_MAXIMO_PERMITIDO.toLocaleString("es-CO")} KM`;
        }

        if (!moto.id_usuario) {
            nuevosErrores.id_usuario = "Seleccione el cliente / dueño de la motocicleta";
        }

        return nuevosErrores;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "placa") {
            const placaFormateada = formatearPlacaAuto(value);
            setMoto(prev => ({ ...prev, placa: placaFormateada }));

            // Si el valor cambia o deja de tener el formato completo, reajustamos estados
            if (!REGEX_PLACA_COMPLETA.test(placaFormateada)) {
                setPlacaExiste(false);
                ultimaPlacaBuscada.current = "";
            }
            return;
        }

        if (name === "kilometraje_actual") {
            const soloNumeros = value.replace(/\D/g, "").slice(0, 7);
            setMoto(prev => ({ ...prev, kilometraje_actual: soloNumeros }));
            return;
        }

        setMoto(prev => ({ ...prev, [name]: value }));
    };

    // Validación cuando el usuario sale del campo (onBlur)
    const handlePlacaBlur = () => {
        const placaLimpia = moto.placa.trim().toUpperCase();
        if (REGEX_PLACA_COMPLETA.test(placaLimpia)) {
            buscarDatosPorPlaca(placaLimpia);
        }
    };

    const handleGuardarModelo = async () => {
        const nombreLimpio = inputModelo.trim();

        if (!nombreLimpio) {
            setErrorModelo("El nombre del modelo es obligatorio.");
            return;
        }

        if (!REGEX_NOMBRE_MODELO.test(nombreLimpio)) {
            setErrorModelo("El modelo debe iniciar con letras (Ej. DUKE 200).");
            return;
        }

        try {
            const payloadModelo = {
                nombre: nombreLimpio,
                nombre_modelo: nombreLimpio
            };

            if (modoModelo === "crear") {
                const res = await axios.post(`${API_BASE_URL}/modelo/crear`, payloadModelo);
                const nuevosModelos = await cargarModelos();
                const idCreado = res.data?.data?.id_modelo || nuevosModelos.find(m => (m.nombre_modelo || m.nombre) === nombreLimpio)?.id_modelo;
                
                if (idCreado) setMoto(prev => ({ ...prev, id_modelo: idCreado }));
            } else {
                await axios.put(`${API_BASE_URL}/modelo/modificar/${moto.id_modelo}`, payloadModelo);
                await cargarModelos();
            }

            setInputModelo("");
            setErrorModelo("");
            setMostrarFormModelo(false);
        } catch (error) {
            console.error("Error al procesar modelo:", error);
            setErrorModelo(error.response?.data?.message || "Error al actualizar/crear el modelo.");
        }
    };

    const handleSave = async () => {
        const erroresValidacion = validarFormularioMoto();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }
        setErrores({});

        try {
            if (idSeleccionado) {
                await axios.put(`${API_BASE_URL}/motocicleta/modificar/${idSeleccionado.id_moto}`, {
                    id_modelo: Number(moto.id_modelo),
                    id_usuario: Number(moto.id_usuario),
                    kilometraje_actual: Number(moto.kilometraje_actual)
                });
                alert("Motocicleta actualizada con éxito");
            } else {
                await axios.post(`${API_BASE_URL}/motocicleta/crear`, {
                    placa: moto.placa,
                    id_modelo: Number(moto.id_modelo),
                    id_usuario: Number(moto.id_usuario),
                    kilometraje_actual: Number(moto.kilometraje_actual)
                });
                alert("Motocicleta registrada con éxito");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar motocicleta:", error);
            if (error.response?.status === 409) {
                setErrores(prev => ({
                    ...prev,
                    placa: error.response.data?.message || "La motocicleta ya se encuentra registrada."
                }));
            } else {
                alert(error.response?.data?.message || "Hubo un error al guardar el registro.");
            }
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fas fa-motorcycle"></i>
                        </div>
                        <h3 className="rs-modal-title">
                            {idSeleccionado ? "Editar Motocicleta" : "Registrar Motocicleta"}
                        </h3>
                    </div>
                    <button className="rs-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    {/* Campo Placa */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Placa de la motocicleta <span className="rs-required">*</span>
                            {buscandoPlaca && (
                                <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#2563eb" }}>
                                    <i className="fas fa-spinner fa-spin"></i> Buscando...
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            className={`rs-input-white ${errores.placa ? "error" : ""}`}
                            name="placa"
                            value={moto.placa}
                            onChange={handleChange}
                            onBlur={handlePlacaBlur}
                            placeholder="WUS 28U"
                            disabled={Boolean(idSeleccionado)}
                            maxLength={7}
                        />

                        {/* Mensaje Informativo: Placa Ya Registrada */}
                        {placaExiste && (
                            <span style={{ display: "block", marginTop: "4px", fontSize: "0.82rem", color: "#d97706", fontWeight: "600" }}>
                                <i className="fas fa-exclamation-triangle" style={{ marginRight: "4px" }}></i>
                                Placa ya registrada (datos precargados)
                            </span>
                        )}

                        {/* Mensaje de Error de Validación */}
                        {errores.placa && <span className="rs-error-msg">{errores.placa}</span>}
                    </div>

                    {/* Selector de Modelo */}
                    <div className="rs-field">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <label className="rs-label" style={{ marginBottom: 0 }}>
                                Modelo <span className="rs-required">*</span>
                            </label>
                            {moto.id_modelo && !mostrarFormModelo && (
                                <button
                                    type="button"
                                    style={{ fontSize: "0.85rem", color: "#2563eb", cursor: "pointer", background: "none", border: "none" }}
                                    onClick={() => {
                                        const actual = modelos.find(m => Number(m.id_modelo) === Number(moto.id_modelo));
                                        if (actual) {
                                            setInputModelo(actual.nombre_modelo || actual.nombre || "");
                                            setModoModelo("editar");
                                            setMostrarFormModelo(true);
                                        }
                                    }}
                                >
                                    <i className="fas fa-pen"></i> Editar este modelo
                                </button>
                            )}
                        </div>

                        <select
                            className={`rs-input-white ${errores.id_modelo ? "error" : ""}`}
                            name="id_modelo"
                            value={moto.id_modelo}
                            onChange={(e) => {
                                if (e.target.value === "nuevo") {
                                    setModoModelo("crear");
                                    setInputModelo("");
                                    setMostrarFormModelo(true);
                                    setMoto(prev => ({ ...prev, id_modelo: "" }));
                                } else {
                                    setMostrarFormModelo(false);
                                    handleChange(e);
                                }
                            }}
                        >
                            <option value="">Seleccione el modelo</option>
                            {modelos.map(m => (
                                <option key={m.id_modelo} value={m.id_modelo}>
                                    {m.nombre_modelo || m.nombre}
                                </option>
                            ))}
                            <option value="nuevo">➕ Crear nuevo modelo...</option>
                        </select>
                        {errores.id_modelo && <span className="rs-error-msg">{errores.id_modelo}</span>}

                        {/* Formulario Inline para Crear/Editar Modelo */}
                        {mostrarFormModelo && (
                            <div style={{ marginTop: "10px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                                <label className="rs-label">
                                    {modoModelo === "crear" ? "Nombre del Nuevo Modelo" : "Editar Nombre del Modelo"}
                                </label>
                                <input
                                    type="text"
                                    className={`rs-input-white ${errorModelo ? "error" : ""}`}
                                    style={{ marginTop: "6px", marginBottom: "8px" }}
                                    placeholder="Ej: DUKE 200"
                                    value={inputModelo}
                                    onChange={(e) => setInputModelo(formatearModeloAut(e.target.value))}
                                />
                                {errorModelo && <span className="rs-error-msg" style={{ marginBottom: "8px", display: "block" }}>{errorModelo}</span>}
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button type="button" className="rs-btn rs-btn-primary" style={{ padding: "6px 12px", fontSize: "0.85rem" }} onClick={handleGuardarModelo}>
                                        {modoModelo === "crear" ? "Guardar Modelo" : "Actualizar Modelo"}
                                    </button>
                                    <button type="button" className="rs-btn rs-btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }} onClick={() => {
                                        setMostrarFormModelo(false);
                                        setInputModelo("");
                                        setErrorModelo("");
                                    }}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Kilometraje Actual */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Kilometraje actual <span className="rs-required">*</span>
                        </label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                                type="text"
                                className={`rs-input-white ${errores.kilometraje_actual ? "error" : ""}`}
                                name="kilometraje_actual"
                                value={formatearNumeroConPuntos(moto.kilometraje_actual)}
                                onChange={handleChange}
                                placeholder="Ej: 2.000"
                                style={{ paddingRight: "55px", width: "100%" }}
                            />
                            <span style={{
                                position: "absolute",
                                right: "12px",
                                backgroundColor: "#f3f4f6",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                color: "#4b5563",
                                pointerEvents: "none"
                            }}>
                                KM
                            </span>
                        </div>
                        {errores.kilometraje_actual && <span className="rs-error-msg">{errores.kilometraje_actual}</span>}
                    </div>

                    {/* Selector Dueño / Cliente */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Dueño / Cliente <span className="rs-required">*</span>
                        </label>
                        <select
                            className={`rs-input-white ${errores.id_usuario ? "error" : ""}`}
                            name="id_usuario"
                            value={moto.id_usuario}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione el cliente</option>
                            {usuarios.map(u => (
                                <option key={u.id_usuario} value={u.id_usuario}>
                                    {u.nombreCompleto}
                                </option>
                            ))}
                        </select>
                        {errores.id_usuario && <span className="rs-error-msg">{errores.id_usuario}</span>}
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="rs-btn rs-btn-primary" onClick={handleSave}>
                        {idSeleccionado ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEditAgr;