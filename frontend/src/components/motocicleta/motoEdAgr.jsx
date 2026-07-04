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

    useEffect(() => {
        const endpoint = idSeleccionado
            ? "http://localhost:4000/api/usuarios/listar"
            : "http://localhost:4000/api/usuarios/sin-moto";
        axios.get(endpoint)
            .then(res => setUsuarios(res.data))
            .catch(err => console.error("Error al cargar usuarios:", err));
    }, [idSeleccionado]);

    useEffect(() => {
        axios.get("http://localhost:4000/api/modelo/listar")
            .then(res => setModelos(res.data))
            .catch(err => console.error("Error al cargar modelos:", err));
    }, []);

    useEffect(() => {
        if (idSeleccionado) {
            setMoto({
                placa: idSeleccionado.placa,
                id_modelo: idSeleccionado.id_modelo,
                kilometraje_actual: idSeleccionado.kilometraje_actual,
                id_usuario: idSeleccionado.id_usuario
            });
        }
    }, [idSeleccionado]);

    // Lógica de placa: mayúsculas + espacio automático + límite
    const formatearPlaca = (valor) => {
        // Solo letras y números, todo a mayúsculas
        let limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

        // Límite de 6 caracteres reales (sin contar el espacio)
        if (limpio.length > 6) limpio = limpio.slice(0, 6);

        // Insertar espacio automático después del 3er carácter
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
            nuevosErrores.placa = "La placa debe tener exactamente 6 caracteres (Ej: WUS 28U)";
        }

        if (!moto.id_modelo) {
            nuevosErrores.id_modelo = "Seleccione un modelo";
        }

        if (!moto.kilometraje_actual && moto.kilometraje_actual !== 0) {
            nuevosErrores.kilometraje_actual = "El kilometraje es obligatorio";
        } else if (isNaN(moto.kilometraje_actual) || Number(moto.kilometraje_actual) < 0) {
            nuevosErrores.kilometraje_actual = "El kilometraje debe ser un número positivo";
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
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
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
            setModelos(res.data);
            const modeloCreado = res.data[res.data.length - 1];
            setMoto({ ...moto, id_modelo: modeloCreado.id_modelo });
            setNuevoModelo("");
            setErrorNuevoModelo("");
            setMostrarNuevoModelo(false);
        } catch (error) {
            console.error("Error al crear modelo:", error);
            setErrorNuevoModelo("Error al guardar el modelo, intenta de nuevo");
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
                    `http://localhost:4000/api/motocicleta/modificar/${idSeleccionado.id_moto}`, moto
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
            alert("Hubo un error al guardar el registro");
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {idSeleccionado ? "Editar moto" : "Registrar moto"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">

                        {/* Placa */}
                        <div className="mb-3">
                            <label className="form-label">
                                Placa de la moto
                                <span className="text-muted ms-2" style={{ fontSize: "0.8rem" }}>
                                    (Ej: WUS 28U — 6 caracteres)
                                </span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errores.placa ? "is-invalid" : ""}`}
                                name="placa"
                                value={moto.placa}
                                onChange={handleChange}
                                placeholder="WUS 28U"
                                maxLength={7}
                            />
                            {errores.placa && <div className="invalid-feedback">{errores.placa}</div>}
                        </div>

                        {/* Modelo */}
                        <div className="mb-3">
                            <label className="form-label">Modelo de Motocicleta</label>
                            <select
                                className={`form-select ${errores.id_modelo ? "is-invalid" : ""}`}
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
                                <option value="nuevo">➕ Nuevo modelo...</option>
                            </select>
                            {errores.id_modelo && <div className="invalid-feedback">{errores.id_modelo}</div>}

                            {mostrarNuevoModelo && (
                                <div className="mt-2 p-3 border rounded bg-light">
                                    <label className="form-label fw-bold">Nombre del nuevo modelo</label>
                                    <input
                                        type="text"
                                        className={`form-control mb-2 ${errorNuevoModelo ? "is-invalid" : ""}`}
                                        placeholder="Ej: HONDA CB 150"
                                        value={nuevoModelo}
                                        onChange={(e) => setNuevoModelo(e.target.value.toUpperCase())}
                                    />
                                    {errorNuevoModelo && (
                                        <div className="invalid-feedback d-block">{errorNuevoModelo}</div>
                                    )}
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-success btn-sm" onClick={handleGuardarNuevoModelo}>
                                            Guardar modelo
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => {
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
                        <div className="mb-3">
                            <label className="form-label">Kilometraje actual</label>
                            <input
                                type="text"
                                className={`form-control ${errores.kilometraje_actual ? "is-invalid" : ""}`}
                                name="kilometraje_actual"
                                value={moto.kilometraje_actual}
                                onChange={handleChange}
                                placeholder="Ej: 15000"
                            />
                            {errores.kilometraje_actual && (
                                <div className="invalid-feedback">{errores.kilometraje_actual}</div>
                            )}
                        </div>

                        {/* Dueño */}
                        <div className="mb-3">
                            <label className="form-label">
                                Dueño de la moto
                                {!idSeleccionado && (
                                    <span className="text-muted ms-2" style={{ fontSize: "0.8rem" }}>
                                        (solo usuarios sin moto registrada)
                                    </span>
                                )}
                            </label>
                            <select
                                className={`form-select ${errores.id_usuario ? "is-invalid" : ""}`}
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
                            {errores.id_usuario && <div className="invalid-feedback">{errores.id_usuario}</div>}
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {idSeleccionado ? "Actualizar" : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalEditAgr;