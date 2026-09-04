import { useState, useEffect } from "react";
import axios from "axios";

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
    const [mostrarNuevoModelo, setMostrarNuevoModelo] = useState(false);
    const [nuevoModelo, setNuevoModelo] = useState("");
    const [errorNuevoModelo, setErrorNuevoModelo] = useState("");

    // Carga de usuarios (clientes sin moto para crear, todos si es edición)
    useEffect(() => {
        const endpoint = idSeleccionado
            ? "http://localhost:4000/api/usuarios/listar"
            : "http://localhost:4000/api/usuarios/sin-moto";
        axios.get(endpoint)
            .then(res => setUsuarios(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
            .catch(err => console.error("Error al cargar usuarios:", err));
    }, [idSeleccionado]);

    // Carga de modelos
    useEffect(() => {
        axios.get("http://localhost:4000/api/modelo/listar")
            .then(res => setModelos(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
            .catch(err => console.error("Error al cargar modelos:", err));
    }, []);

    // Carga de valores para edición
    useEffect(() => {
        if (idSeleccionado) {
            setMoto({
                placa: idSeleccionado.placa || "",
                id_modelo: idSeleccionado.id_modelo || "",
                kilometraje_actual: idSeleccionado.kilometraje_actual !== undefined ? idSeleccionado.kilometraje_actual : "",
                id_usuario: idSeleccionado.id_usuario || ""
            });
        }
    }, [idSeleccionado]);

    const formatearPlaca = (valor) => {
        let limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (limpio.length > 6) limpio = limpio.slice(0, 6);
        if (limpio.length > 3) {
            return limpio.slice(0, 3) + " " + limpio.slice(3);
        }
        return limpio;
    };

    const validar = () => {
        const nuevosErrores = {};
        const placaSinEspacio = moto.placa.replace(/\s/g, "");

        if (!moto.placa.trim()) {
            nuevosErrores.placa = "La placa es obligatoria";
        } else if (placaSinEspacio.length !== 6) {
            nuevosErrores.placa = "Formato de placa inválido (Ej: WUS 28U)";
        }

        if (!moto.id_modelo) {
            nuevosErrores.id_modelo = "Seleccione un modelo";
        }

        if (moto.kilometraje_actual === "" || moto.kilometraje_actual === null) {
            nuevosErrores.kilometraje_actual = "El kilometraje es obligatorio";
        } else if (isNaN(moto.kilometraje_actual) || Number(moto.kilometraje_actual) < 0) {
            nuevosErrores.kilometraje_actual = "Ingrese un kilometraje válido";
        }

        if (!moto.id_usuario) {
            nuevosErrores.id_usuario = "Seleccione un dueño";
        }

        return nuevosErrores;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "placa") {
            setMoto({ ...moto, placa: formatearPlaca(value) });
            return;
        }

        if (name === "kilometraje_actual") {
            if (value === "" || /^\d*$/.test(value)) {
                setMoto({ ...moto, [name]: value });
            }
            return;
        }

        setMoto({ ...moto, [name]: value });
    };

    const handleGuardarNuevoModelo = async () => {
        if (!nuevoModelo.trim()) {
            setErrorNuevoModelo("El nombre del modelo es obligatorio");
            return;
        }

        try {
            await axios.post("http://localhost:4000/api/modelo/crear", { 
                nombre: nuevoModelo.toUpperCase() 
            });
            const res = await axios.get("http://localhost:4000/api/modelo/listar");
            const nuevosModelos = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setModelos(nuevosModelos);
            if (nuevosModelos.length > 0) {
                const modeloCreado = nuevosModelos[nuevosModelos.length - 1];
                setMoto({ ...moto, id_modelo: modeloCreado.id_modelo });
            }
            setNuevoModelo("");
            setErrorNuevoModelo("");
            setMostrarNuevoModelo(false);
        } catch (error) {
            console.error("Error al crear modelo:", error);
            setErrorNuevoModelo("No se pudo guardar el modelo");
        }
    };

    const handleSave = async () => {
        const erroresValidacion = validar();
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            return;
        }
        setErrores({});

        try {
            if (idSeleccionado) {
                await axios.put(
                    `http://localhost:4000/api/motocicleta/modificar/${idSeleccionado.id_moto}`, 
                    moto
                );
                alert("Motocicleta actualizada con éxito");
            } else {
                await axios.post("http://localhost:4000/api/motocicleta/crear", moto);
                alert("Motocicleta agregada con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert(error.response?.data?.message || "Hubo un error al guardar el registro");
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
                    {/* Placa */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Placa de la motocicleta <span className="rs-required">*</span>
                        </label>
                        <input
                            type="text"
                            className={`rs-input-white ${errores.placa ? "error" : ""}`}
                            name="placa"
                            value={moto.placa}
                            onChange={handleChange}
                            placeholder="WUS 28U"
                            maxLength={7}
                        />
                        {errores.placa && <span className="rs-error-msg">{errores.placa}</span>}
                    </div>

                    {/* Modelo */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Modelo <span className="rs-required">*</span>
                        </label>
                        <select
                            className={`rs-input-white ${errores.id_modelo ? "error" : ""}`}
                            name="id_modelo"
                            value={moto.id_modelo}
                            onChange={(e) => {
                                if (e.target.value === "nuevo") {
                                    setMostrarNuevoModelo(true);
                                    setMoto({ ...moto, id_modelo: "" });
                                } else {
                                    setMostrarNuevoModelo(false);
                                    handleChange(e);
                                }
                            }}
                        >
                            <option value="">Seleccione el modelo</option>
                            {modelos.map(m => (
                                <option key={m.id_modelo} value={m.id_modelo}>
                                    {m.nombre}
                                </option>
                            ))}
                            <option value="nuevo">➕ Crear nuevo modelo...</option>
                        </select>
                        {errores.id_modelo && <span className="rs-error-msg">{errores.id_modelo}</span>}

                        {mostrarNuevoModelo && (
                            <div style={{ marginTop: "10px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                                <label className="rs-label">Nombre del nuevo modelo</label>
                                <input
                                    type="text"
                                    className={`rs-input-white ${errorNuevoModelo ? "error" : ""}`}
                                    style={{ marginTop: "6px", marginBottom: "8px" }}
                                    placeholder="Ej: HONDA CB 150"
                                    value={nuevoModelo}
                                    onChange={(e) => setNuevoModelo(e.target.value.toUpperCase())}
                                />
                                {errorNuevoModelo && <span className="rs-error-msg" style={{ marginBottom: "8px" }}>{errorNuevoModelo}</span>}
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button type="button" className="rs-btn rs-btn-primary rs-btn-icon" onClick={handleGuardarNuevoModelo}>
                                        Guardar
                                    </button>
                                    <button type="button" className="rs-btn rs-btn-secondary rs-btn-icon" onClick={() => {
                                        setMostrarNuevoModelo(false);
                                        setNuevoModelo("");
                                        setErrorNuevoModelo("");
                                    }}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Kilometraje */}
                    <div className="rs-field">
                        <label className="rs-label">
                            Kilometraje actual <span className="rs-required">*</span>
                        </label>
                        <input
                            type="text"
                            className={`rs-input-white ${errores.kilometraje_actual ? "error" : ""}`}
                            name="kilometraje_actual"
                            value={moto.kilometraje_actual}
                            onChange={handleChange}
                            placeholder="Ej: 15000"
                        />
                        {errores.kilometraje_actual && <span className="rs-error-msg">{errores.kilometraje_actual}</span>}
                    </div>

                    {/* Dueño */}
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
                            <option value="">Seleccione el dueño</option>
                            {usuarios.map(u => (
                                <option key={u.id_usuario} value={u.id_usuario}>
                                    {u.nombre} {u.apellido}
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