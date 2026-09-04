import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "../../axiosConfig";
import { useToast } from "../../context/ToastContext";

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

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexSoloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]*$/;

const ModalEdtMod = ({ idSeleccionado, onClose, onSuccess }) => {
    const { mostrarToast } = useToast();

    const [usuario, setUsuario] = useState({
        nombre: "",
        apellido: "",
        correo_usuario: "",
        telefono_usuario: "",
        id_tipo_usuario: ""
    });

    const [errores, setErrores] = useState({});
    const [categoriaUser, setCategoriaUser] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [verificandoCorreo, setVerificandoCorreo] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:4000/api/clasificacion_de_usuarios/listar")
            .then(res => {
                // FILTRO DE SEGURIDAD: Excluir rol de Administrador
                const categoriasSinAdmin = res.data.filter(cat => 
                    !cat.categoria_usuario.toLowerCase().includes("admin")
                );

                setCategoriaUser(categoriasSinAdmin.map(cat => ({
                    value: cat.id_tipo_usuario,
                    label: cat.categoria_usuario
                })));
            })
            .catch(() => mostrarToast("Error al cargar tipos de usuario", "error"));
    }, []);

    useEffect(() => {
        if (idSeleccionado) {
            setUsuario({
              nombre: idSeleccionado.nombre || "",
              apellido: idSeleccionado.apellido || "",
              correo_usuario: idSeleccionado.correo_usuario || "",
              telefono_usuario: idSeleccionado.telefono_usuario || "",
              id_tipo_usuario: idSeleccionado.id_tipo_usuario || ""
            });
        }
    }, [idSeleccionado]);

    const categoriaSeleccionadaObj = categoriaUser.find(c => c.value === usuario.id_tipo_usuario);
    const labelCategoria = categoriaSeleccionadaObj?.label?.toLowerCase() || "";

    const esTecnico = labelCategoria.includes("técnico") || labelCategoria.includes("tecnico");
    const esCliente = labelCategoria.includes("cliente");

    useEffect(() => {
        if (!usuario.correo_usuario || idSeleccionado) return;
        if (!regexEmail.test(usuario.correo_usuario)) return;

        const timer = setTimeout(async () => {
            setVerificandoCorreo(true);
            try {
                const res = await axios.get("http://localhost:4000/api/usuarios/verificar-correo", {
                    params: { correo_usuario: usuario.correo_usuario }
                });
                if (!res.data.valido) {
                    const mensaje = res.data.motivo === "duplicado"
                        ? "Este correo ya está registrado."
                        : "Formato de correo inválido.";
                    setErrores(prev => ({ ...prev, correo_usuario: mensaje }));
                } else {
                    setErrores(prev => ({ ...prev, correo_usuario: "" }));
                }
            } catch {
                // Si falla la consulta no interrumpe el flujo principal
            } finally {
                setVerificandoCorreo(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [usuario.correo_usuario, idSeleccionado]);

    const capitalizar = (valor) => {
        if (!valor) return valor;
        return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "nombre" || name === "apellido") {
            if (!regexSoloLetras.test(value)) return;
            setUsuario({ ...usuario, [name]: capitalizar(value) });
        } else if (name === "telefono_usuario") {
            const soloNumeros = value.replace(/\D/g, "");
            if (soloNumeros.length <= 10) {
                setUsuario({ ...usuario, [name]: soloNumeros });
            }
        } else {
            setUsuario({ ...usuario, [name]: value });
        }

        if (errores[name]) setErrores({ ...errores, [name]: "" });
    };

    const handleSelectCategory = (selected) => {
        setUsuario({ ...usuario, id_tipo_usuario: selected ? selected.value : "" });
        if (errores.id_tipo_usuario) setErrores({ ...errores, id_tipo_usuario: "" });
    };

    const validar = () => {
        const nuevosErrores = {};

        if (!usuario.id_tipo_usuario) {
            nuevosErrores.id_tipo_usuario = "Seleccione el tipo de usuario.";
        }

        if (!usuario.correo_usuario.trim()) {
            nuevosErrores.correo_usuario = "El correo electrónico es obligatorio.";
        } else if (!regexEmail.test(usuario.correo_usuario)) {
            nuevosErrores.correo_usuario = "Ingrese un correo electrónico válido.";
        } else if (errores.correo_usuario) {
            nuevosErrores.correo_usuario = errores.correo_usuario;
        }

        if (!esTecnico || idSeleccionado) {
            if (!usuario.nombre.trim()) {
                nuevosErrores.nombre = "El nombre es obligatorio.";
            } else if (!regexSoloLetras.test(usuario.nombre.trim())) {
                nuevosErrores.nombre = "El nombre solo debe contener letras.";
            }

            if (!usuario.apellido.trim()) {
                nuevosErrores.apellido = "El apellido es obligatorio.";
            } else if (!regexSoloLetras.test(usuario.apellido.trim())) {
                nuevosErrores.apellido = "El apellido solo debe contener letras.";
            }

            if (!usuario.telefono_usuario.trim()) {
                nuevosErrores.telefono_usuario = "El teléfono es obligatorio.";
            } else if (usuario.telefono_usuario.length !== 10) {
                nuevosErrores.telefono_usuario = "El teléfono debe tener exactamente 10 dígitos.";
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSave = async () => {
        if (!validar()) return;

        try {
            setCargando(true);

            if (idSeleccionado) {
                await axios.put(`http://localhost:4000/api/usuarios/modificar/${idSeleccionado.id_usuario}`, usuario);
                mostrarToast("Usuario actualizado correctamente.", "success");

            } else if (esTecnico) {
                await axios.post("http://localhost:4000/api/usuarios/invitar-tecnico", {
                    correo_usuario: usuario.correo_usuario,
                    id_tipo_usuario: usuario.id_tipo_usuario
                });
                mostrarToast("Código de activación enviado exitosamente al correo del técnico.", "success");

            } else {
                const datosCliente = {
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo_usuario: usuario.correo_usuario,
                    telefono_usuario: usuario.telefono_usuario,
                    id_tipo_usuario: usuario.id_tipo_usuario
                };
                await axios.post("http://localhost:4000/api/usuarios/invitar-cliente", datosCliente);
                mostrarToast("Cliente registrado. Se ha enviado un enlace al correo para establecer su contraseña.", "success");
            }

            onSuccess();
            onClose();
        } catch (error) {
            const msg = error.response?.data?.message || "Error al procesar la solicitud.";
            mostrarToast(msg, "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal rs-modal-white" style={{ maxWidth: '650px', width: '90%' }}>
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-user-gear"></i>
                        </div>
                        <h5 className="rs-modal-title">
                            {idSeleccionado
                                ? "Editar Usuario"
                                : esTecnico
                                    ? "Invitar Nuevo Técnico"
                                    : "Registrar Nuevo Usuario"
                            }
                        </h5>
                    </div>
                    <button className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>

                        <div className="rs-field" style={{ gridColumn: '1 / -1' }}>
                            <label className="rs-label">
                                Tipo de usuario <span className="rs-required">*</span>
                            </label>
                            <Select
                                options={categoriaUser}
                                styles={selectStyles}
                                placeholder="Seleccione el tipo de usuario"
                                value={categoriaUser.find(c => c.value === usuario.id_tipo_usuario) || null}
                                onChange={handleSelectCategory}
                                isClearable={!idSeleccionado}
                                isDisabled={!!idSeleccionado}
                            />
                            {errores.id_tipo_usuario && (
                                <span className="rs-error-msg">
                                    <i className="fa-solid fa-circle-exclamation"></i>
                                    {errores.id_tipo_usuario}
                                </span>
                            )}
                        </div>

                        {esCliente && !idSeleccionado && (
                            <div style={{
                                gridColumn: '1 / -1',
                                backgroundColor: '#fff3e0',
                                borderLeft: '4px solid #FF8C00',
                                padding: '12px 16px',
                                borderRadius: '6px'
                            }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#b75300', fontWeight: '500' }}>
                                    <i className="fa-solid fa-envelope-circle-check me-2"></i>
                                    <strong>Registro Inicial de Cliente:</strong> Ingresa los datos básicos. Al guardar, se enviará automáticamente un correo al cliente con un enlace para que cree su contraseña.
                                </p>
                            </div>
                        )}

                        {esTecnico && !idSeleccionado ? (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div className="rs-field">
                                    <label className="rs-label">
                                        Correo electrónico del técnico <span className="rs-required">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="email"
                                            className={`rs-input-white ${errores.correo_usuario ? 'error' : ''}`}
                                            name="correo_usuario"
                                            value={usuario.correo_usuario}
                                            onChange={handleChange}
                                            placeholder="ejemplo@tecnico.com"
                                        />
                                        {verificandoCorreo && (
                                            <i className="fa-solid fa-spinner fa-spin"
                                               style={{ position: 'absolute', right: '12px', top: '12px', color: '#FF8C00' }}>
                                            </i>
                                        )}
                                    </div>
                                    {errores.correo_usuario && (
                                        <span className="rs-error-msg">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            {errores.correo_usuario}
                                        </span>
                                    )}
                                </div>
                                <small className="rs-hint" style={{ marginTop: '8px', display: 'block' }}>
                                    <i className="fa-solid fa-paper-plane me-1"></i>
                                    Se enviará un código de activación válido por 10 minutos a este correo.
                                </small>
                            </div>
                        ) : (
                            <>
                                <div className="rs-field">
                                    <label className="rs-label">
                                        Nombre <span className="rs-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`rs-input-white ${errores.nombre ? 'error' : ''}`}
                                        name="nombre"
                                        value={usuario.nombre}
                                        onChange={handleChange}
                                        placeholder="Ingrese el nombre"
                                        maxLength={50}
                                    />
                                    {errores.nombre && (
                                        <span className="rs-error-msg">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            {errores.nombre}
                                        </span>
                                    )}
                                </div>

                                <div className="rs-field">
                                    <label className="rs-label">
                                        Apellido <span className="rs-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`rs-input-white ${errores.apellido ? 'error' : ''}`}
                                        name="apellido"
                                        value={usuario.apellido}
                                        onChange={handleChange}
                                        placeholder="Ingrese el apellido"
                                        maxLength={50}
                                    />
                                    {errores.apellido && (
                                        <span className="rs-error-msg">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            {errores.apellido}
                                        </span>
                                    )}
                                </div>

                                <div className="rs-field">
                                    <label className="rs-label">
                                        Correo electrónico <span className="rs-required">*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="email"
                                            className={`rs-input-white ${errores.correo_usuario ? 'error' : ''}`}
                                            name="correo_usuario"
                                            value={usuario.correo_usuario}
                                            onChange={handleChange}
                                            placeholder="correo@ejemplo.com"
                                        />
                                        {verificandoCorreo && (
                                            <i className="fa-solid fa-spinner fa-spin"
                                               style={{ position: 'absolute', right: '12px', top: '12px', color: '#FF8C00' }}>
                                            </i>
                                        )}
                                    </div>
                                    {errores.correo_usuario && (
                                        <span className="rs-error-msg">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            {errores.correo_usuario}
                                        </span>
                                    )}
                                </div>

                                <div className="rs-field">
                                    <label className="rs-label">
                                        Teléfono <span className="rs-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`rs-input-white ${errores.telefono_usuario ? 'error' : ''}`}
                                        name="telefono_usuario"
                                        value={usuario.telefono_usuario}
                                        onChange={handleChange}
                                        placeholder="Ej: 3001234567"
                                        maxLength={10}
                                    />
                                    {errores.telefono_usuario && (
                                        <span className="rs-error-msg">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            {errores.telefono_usuario}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="rs-btn rs-btn-primary" onClick={handleSave} disabled={cargando}>
                        {cargando ? (
                            <><i className="fa-solid fa-spinner fa-spin me-1"></i> Procesando...</>
                        ) : esTecnico && !idSeleccionado ? (
                            <><i className="fa-solid fa-paper-plane me-1"></i> Enviar invitación</>
                        ) : esCliente && !idSeleccionado ? (
                            <><i className="fa-solid fa-paper-plane me-1"></i> Registrar y enviar acceso</>
                        ) : (
                            <><i className={`fa-solid ${idSeleccionado ? 'fa-pen' : 'fa-plus'} me-1`}></i> {idSeleccionado ? "Actualizar" : "Guardar"}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEdtMod;