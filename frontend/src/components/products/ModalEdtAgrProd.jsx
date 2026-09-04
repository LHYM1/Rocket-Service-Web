import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "../../axiosConfig";
import { useToast } from "../../context/ToastContext";

const toTitleCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const limpiarNumero = (valor) => {
    return parseInt(String(valor).replace(/[.,]/g, '')) || 0;
};

const selectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: '#f9fafb',
        border: `1px solid ${state.isFocused ? '#FF8C00' : '#e5e7eb'}`,
        borderRadius: '8px',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(255,140,0,0.1)' : 'none',
        padding: '2px 4px',
        fontSize: '14px',
        fontFamily: 'Poppins, sans-serif',
        cursor: 'pointer',
        '&:hover': { borderColor: '#FF8C00' }
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#FF8C00'
            : state.isFocused ? '#fff3e0' : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#1a1a2e',
        fontSize: '14px',
        fontFamily: 'Poppins, sans-serif',
        cursor: 'pointer',
        padding: '10px 14px',
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 9999,
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' }),
    singleValue: (base) => ({ ...base, color: '#1a1a2e', fontSize: '14px' }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
        ...base,
        color: '#9ca3af',
        '&:hover': { color: '#FF8C00' }
    }),
};

const selectStylesDisabled = {
    ...selectStyles,
    control: (base) => ({
        ...selectStyles.control(base, {}),
        backgroundColor: '#f3f4f6',
        cursor: 'not-allowed',
        opacity: 0.7,
    }),
};

const ModalEdtAgrProd = ({ idSeleccionado, onClose, onSuccess }) => {
    const { mostrarToast } = useToast();

    const [insumo, setInsumo] = useState({
        id_categoria: "",
        id_unidad: "",
        nombre_insumo: "",
        cantidad_disponible: "",
        precio_unitario: "",
        cantidad_adicional: ""
    });

    const [errores, setErrores] = useState({});
    const [categorias, setCategorias] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Estado para el mini-formulario de "nueva unidad de medida"
    const [mostrarFormUnidad, setMostrarFormUnidad] = useState(false);
    const [nuevaUnidad, setNuevaUnidad] = useState({ nombre: "", simbolo: "" });
    const [errorUnidad, setErrorUnidad] = useState("");
    const [guardandoUnidad, setGuardandoUnidad] = useState(false);

    useEffect(() => {
        if (idSeleccionado) {
            setInsumo({
                id_categoria: idSeleccionado.id_categoria,
                id_unidad: idSeleccionado.id_unidad,
                nombre_insumo: idSeleccionado.nombre_insumo,
                precio_unitario: idSeleccionado.precio_unitario,
                cantidad_adicional: ""
            });
        }
    }, [idSeleccionado]);

    const cargarUnidades = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/unidad_de_medida/listar");
            setUnidades(res.data.map(u => ({
                value: u.id_unidad,
                label: u.simbolo ? `${u.nombre} (${u.simbolo})` : u.nombre
            })));
        } catch {
            mostrarToast("Error al cargar unidades de medida", "error");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await axios.get("http://localhost:4000/api/categoria/listar");
                setCategorias(catRes.data.map(c => ({
                    value: c.id_categoria,
                    label: c.nombre
                })));
                await cargarUnidades();
            } catch (error) {
                mostrarToast("Error al cargar datos", "error");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nuevoValor = value;
        if (name === "nombre_insumo") nuevoValor = toTitleCase(value);
        setInsumo({ ...insumo, [name]: nuevoValor });
        if (errores[name]) setErrores({ ...errores, [name]: "" });
    };

    const handleSelect = (name, selected) => {
        setInsumo({ ...insumo, [name]: selected ? selected.value : "" });
        if (errores[name]) setErrores({ ...errores, [name]: "" });
    };

    // --- Lógica del mini-formulario de nueva unidad de medida ---
    const handleChangeUnidad = (e) => {
        const { name, value } = e.target;
        setNuevaUnidad({ ...nuevaUnidad, [name]: value });
        if (errorUnidad) setErrorUnidad("");
    };

    const handleGuardarUnidad = async () => {
        if (!nuevaUnidad.nombre.trim()) {
            setErrorUnidad("El nombre de la unidad es obligatorio.");
            return;
        }

        try {
            setGuardandoUnidad(true);
            const res = await axios.post("http://localhost:4000/api/unidad_de_medida/crear", nuevaUnidad);

            // Recarga el listado y selecciona automáticamente la nueva unidad
            await cargarUnidades();
            setInsumo(prev => ({ ...prev, id_unidad: res.data.id_unidad }));

            mostrarToast("Unidad de medida creada y seleccionada.", "success");
            setMostrarFormUnidad(false);
            setNuevaUnidad({ nombre: "", simbolo: "" });
        } catch (error) {
            const msg = error.response?.data?.message || "Error al crear la unidad de medida.";
            setErrorUnidad(msg);
        } finally {
            setGuardandoUnidad(false);
        }
    };
    // --- Fin lógica de nueva unidad ---

    const validar = () => {
        const nuevosErrores = {};
        if (!idSeleccionado) {
            if (!insumo.id_categoria) nuevosErrores.id_categoria = "Seleccione una categoría.";
            if (!insumo.id_unidad) nuevosErrores.id_unidad = "Seleccione una unidad de medida.";
            if (!insumo.nombre_insumo.trim()) nuevosErrores.nombre_insumo = "El nombre es obligatorio.";
            if (!insumo.cantidad_disponible) nuevosErrores.cantidad_disponible = "La cantidad inicial es obligatoria.";
            else if (limpiarNumero(insumo.cantidad_disponible) <= 0)
                nuevosErrores.cantidad_disponible = "La cantidad inicial debe ser mayor a cero.";
            if (!insumo.precio_unitario) nuevosErrores.precio_unitario = "El precio es obligatorio.";
            else if (limpiarNumero(insumo.precio_unitario) < 1000)
                nuevosErrores.precio_unitario = "El precio unitario debe ser mínimo $1.000.";
        } else {
            if (!insumo.nombre_insumo.trim()) nuevosErrores.nombre_insumo = "El nombre es obligatorio.";
            if (!insumo.precio_unitario) nuevosErrores.precio_unitario = "El precio es obligatorio.";
            else if (limpiarNumero(insumo.precio_unitario) < 1000)
                nuevosErrores.precio_unitario = "El precio unitario debe ser mínimo $1.000.";
            if (insumo.cantidad_adicional !== "" && limpiarNumero(insumo.cantidad_adicional) <= 0)
                nuevosErrores.cantidad_adicional = "La cantidad a agregar debe ser mayor a cero.";
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSave = async () => {
        if (!validar()) return;
        try {
            setCargando(true);
            const payload = {
                ...insumo,
                precio_unitario: limpiarNumero(insumo.precio_unitario),
                cantidad_disponible: limpiarNumero(insumo.cantidad_disponible),
                cantidad_adicional: insumo.cantidad_adicional ? limpiarNumero(insumo.cantidad_adicional) : 0
            };
            if (idSeleccionado) {
                await axios.put(`http://localhost:4000/api/insumos/modificar/${idSeleccionado.id_insumo}`, payload);
                mostrarToast("Insumo actualizado correctamente.", "success");
            } else {
                await axios.post("http://localhost:4000/api/insumos/crear", payload);
                mostrarToast("Insumo registrado correctamente.", "success");
            }
            onSuccess();
            onClose();
        } catch (error) {
            const msg = error.response?.data?.message || "Error al guardar el insumo.";
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
                            <i className="fa-solid fa-box-open"></i>
                        </div>
                        <h5 className="rs-modal-title">
                            {idSeleccionado ? "Editar Insumo" : "Registrar Insumo"}
                        </h5>
                    </div>
                    <button className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-field">
                        <label className="rs-label">
                            Categoría <span className="rs-required">*</span>
                        </label>
                        <Select
                            options={categorias}
                            styles={selectStyles}
                            placeholder="Seleccione una categoría"
                            value={categorias.find(c => c.value === insumo.id_categoria) || null}
                            onChange={(selected) => handleSelect("id_categoria", selected)}
                            isClearable
                        />
                        {errores.id_categoria && (
                            <span className="rs-error-msg">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {errores.id_categoria}
                            </span>
                        )}
                    </div>

                    {/* Unidad de medida + creación embebida */}
                    <div className="rs-field">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="rs-label">
                                Unidad de medida <span className="rs-required">*</span>
                            </label>
                            {!idSeleccionado && (
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormUnidad(!mostrarFormUnidad)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#FF8C00',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    <i className={`fa-solid ${mostrarFormUnidad ? 'fa-xmark' : 'fa-plus'} me-1`}></i>
                                    {mostrarFormUnidad ? 'Cancelar' : 'Nueva unidad'}
                                </button>
                            )}
                        </div>

                        {mostrarFormUnidad ? (
                            <div style={{
                                backgroundColor: '#fff3e0',
                                border: '1px solid #FF8C00',
                                borderRadius: '8px',
                                padding: '12px',
                                marginTop: '6px'
                            }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        className="rs-input-white"
                                        name="nombre"
                                        placeholder="Nombre (Ej: Metro)"
                                        value={nuevaUnidad.nombre}
                                        onChange={handleChangeUnidad}
                                        style={{ flex: 2 }}
                                    />
                                    <input
                                        type="text"
                                        className="rs-input-white"
                                        name="simbolo"
                                        placeholder="Símbolo (Ej: M)"
                                        value={nuevaUnidad.simbolo}
                                        onChange={handleChangeUnidad}
                                        style={{ flex: 1 }}
                                        maxLength={10}
                                    />
                                </div>
                                {errorUnidad && (
                                    <span className="rs-error-msg" style={{ display: 'block', marginBottom: '8px' }}>
                                        <i className="fa-solid fa-circle-exclamation"></i>
                                        {errorUnidad}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="rs-btn rs-btn-primary"
                                    style={{ width: '100%', padding: '8px' }}
                                    onClick={handleGuardarUnidad}
                                    disabled={guardandoUnidad}
                                >
                                    {guardandoUnidad ? "Guardando..." : "Guardar unidad de medida"}
                                </button>
                            </div>
                        ) : (
                            <>
                                <Select
                                    options={unidades}
                                    styles={idSeleccionado ? selectStylesDisabled : selectStyles}
                                    placeholder="Seleccione una unidad de medida"
                                    value={unidades.find(u => u.value === insumo.id_unidad) || null}
                                    onChange={(selected) => handleSelect("id_unidad", selected)}
                                    isDisabled={!!idSeleccionado}
                                    isClearable={!idSeleccionado}
                                />
                                {idSeleccionado && (
                                    <small className="rs-hint">
                                        <i className="fa-solid fa-lock me-1"></i>
                                        No se puede modificar una vez creado.
                                    </small>
                                )}
                                {errores.id_unidad && (
                                    <span className="rs-error-msg">
                                        <i className="fa-solid fa-circle-exclamation"></i>
                                        {errores.id_unidad}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">
                            Nombre del insumo <span className="rs-required">*</span>
                        </label>
                        <input
                            type="text"
                            className={`rs-input-white ${errores.nombre_insumo ? 'error' : ''}`}
                            name="nombre_insumo"
                            value={insumo.nombre_insumo}
                            onChange={handleChange}
                            placeholder="Ej: Aceite De Motor 20w50"
                        />
                        {errores.nombre_insumo && (
                            <span className="rs-error-msg">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {errores.nombre_insumo}
                            </span>
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">
                            Precio unitario <span className="rs-required">*</span>
                        </label>
                        <input
                            type="number"
                            className={`rs-input-white ${errores.precio_unitario ? 'error' : ''}`}
                            name="precio_unitario"
                            value={insumo.precio_unitario}
                            onChange={handleChange}
                            min="1000"
                            placeholder="Mínimo $1.000"
                        />
                        {errores.precio_unitario && (
                            <span className="rs-error-msg">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {errores.precio_unitario}
                            </span>
                        )}
                    </div>

                    {idSeleccionado ? (
                        <div className="rs-field">
                            <label className="rs-label">Cantidad a agregar al stock</label>
                            <input
                                type="number"
                                className={`rs-input-white ${errores.cantidad_adicional ? 'error' : ''}`}
                                name="cantidad_adicional"
                                value={insumo.cantidad_adicional}
                                onChange={handleChange}
                                min="1"
                                placeholder="Cantidad adicional a sumar"
                            />
                            <small className="rs-hint">
                                <i className="fa-solid fa-cubes me-1"></i>
                                Stock actual: {idSeleccionado.cantidad_disponible} unidades
                            </small>
                            {errores.cantidad_adicional && (
                                <span className="rs-error-msg">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    {errores.cantidad_adicional}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="rs-field">
                            <label className="rs-label">
                                Cantidad inicial <span className="rs-required">*</span>
                            </label>
                            <input
                                type="number"
                                className={`rs-input-white ${errores.cantidad_disponible ? 'error' : ''}`}
                                name="cantidad_disponible"
                                value={insumo.cantidad_disponible}
                                onChange={handleChange}
                                min="1"
                                placeholder="Debe ser mayor a cero"
                            />
                            {errores.cantidad_disponible && (
                                <span className="rs-error-msg">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    {errores.cantidad_disponible}
                                </span>
                            )}
                        </div>
                    )}
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

export default ModalEdtAgrProd;