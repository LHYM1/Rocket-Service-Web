import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './login.css';
import { useToast } from "../../context/ToastContext";

// URL base del backend -- viene de la variable de entorno REACT_APP_API_URL
// (igual que en axiosConfig.js). Este archivo usa fetch() nativo, no axios,
// por eso necesita su propia constante en vez de heredar la configuración central.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Validaciones integradas directamente en el archivo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validarLogin = ({ email, password }) => {
    const emailValido = typeof email === "string" && EMAIL_REGEX.test(email.trim());
    const passValida = typeof password === "string" && password.length >= 8 && password.length <= 20;

    let mensajeEmail = "";
    let mensajePassword = "";

    if (!emailValido) {
        mensajeEmail = email.trim() === "" 
            ? "El correo electrónico es obligatorio" 
            : "Ingresa un correo electrónico válido (ejemplo@dominio.com)";
    }

    if (!passValida) {
        mensajePassword = password === "" 
            ? "La contraseña es obligatoria" 
            : "La contraseña debe tener entre 8 y 20 caracteres";
    }

    if (!emailValido || !passValida) {
        return {
            mensajeGeneral: "Por favor corrige los errores antes de continuar",
            erroresCampos: {
                email: !emailValido,
                password: !passValida
            },
            mensajesIndividuales: {
                email: mensajeEmail,
                password: mensajePassword
            }
        };
    }

    return null;
};

function Iniciarsesion() {
    const navigate = useNavigate();
    const { mostrarToast } = useToast();

    const [form, setForm] = useState({ usuario: "", contrasena: "" });
    const [errores, setErrores] = useState({ usuario: false, contrasena: false });
    const [mensajesInvisibles, setMensajesInvisibles] = useState({ usuario: "", contrasena: "" });
    const [cargando, setCargando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const resultadoValidacion = validarLogin({
            email: form.usuario,
            password: form.contrasena
        });

        if (resultadoValidacion) {
            setErrores({
                usuario: resultadoValidacion.erroresCampos.email,
                contrasena: resultadoValidacion.erroresCampos.password
            });
            setMensajesInvisibles({
                usuario: resultadoValidacion.mensajesIndividuales.email,
                contrasena: resultadoValidacion.mensajesIndividuales.password
            });
            mostrarToast(resultadoValidacion.mensajeGeneral, "warning");
            return;
        }

        setErrores({ usuario: false, contrasena: false });
        setMensajesInvisibles({ usuario: "", contrasena: "" });
        setCargando(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    correo_usuario: form.usuario,
                    contrasena: form.contrasena
                })
            });

            const data = await response.json();

            if (!response.ok) {
                mostrarToast(data.message || "Error al iniciar sesión", "error");
                setForm({ ...form, contrasena: "" });
                setCargando(false);
                return;
            }

            const base64Url = data.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);

            const JWT_PATRON = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
            const ROLES_VALIDOS = ["Administrador", "Técnico", "Cliente"];
            const ID_PATRON = /^\d+$/;

            const tokenSeguro = (typeof data.token === "string" && JWT_PATRON.test(data.token))
                ? data.token
                : "";
            const rolNormalizado = typeof payload.role === "string" ? payload.role.normalize("NFC") : "";
            const rolSeguro = ROLES_VALIDOS.includes(rolNormalizado) ? rolNormalizado : "";
            const idComoTexto = String(payload.id);
            const idSeguro = ID_PATRON.test(idComoTexto) ? idComoTexto : "";

            if (!tokenSeguro || !rolSeguro || !idSeguro) {
                mostrarToast("Respuesta del servidor inválida", "error");
                setCargando(false);
                return;
            }

            localStorage.setItem("token", tokenSeguro);
            localStorage.setItem("rol", rolSeguro);
            localStorage.setItem("userId", idSeguro);
            window.dispatchEvent(new CustomEvent('authChanged'));

            if (rolSeguro === "Administrador") {
                fetch(`${API_URL}/api/insumos/stock-bajo`, {
                    headers: { Authorization: `Bearer ${tokenSeguro}` }
                })
                    .then(res => res.json())
                    .then(bajos => {
                        if (Array.isArray(bajos)) {
                            bajos.forEach(insumo => {
                                mostrarToast(
                                    `El insumo ${insumo.nombre_insumo} tiene stock bajo: ${insumo.cantidad_disponible} unidades disponibles.`,
                                    "warning"
                                );
                            });
                        }
                    })
                    .catch(() => {});

                fetch(`${API_URL}/api/pre_revision/pendientes-orden`, {
                    headers: { Authorization: `Bearer ${tokenSeguro}` }
                })
                    .then(res => res.json())
                    .then(pendientes => {
                        if (Array.isArray(pendientes)) {
                            pendientes.forEach(pr => {
                                mostrarToast(
                                    `La pre-revisión del cliente ${pr.cliente} requiere reparación. Puedes crear la orden de servicio.`,
                                    "info"
                                );
                            });
                        }
                    })
                    .catch(() => {});

                fetch(`${API_URL}/api/notificaciones/pendientes-admin`, {
                    headers: { Authorization: `Bearer ${tokenSeguro}` }
                })
                    .then(res => res.json())
                    .then(notifs => {
                        if (Array.isArray(notifs) && notifs.length > 0) {
                            notifs.forEach(n => mostrarToast(n.mensaje, "warning"));
                            fetch(`${API_URL}/api/notificaciones/marcar-leidas`, {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${tokenSeguro}` }
                            }).catch(() => {});
                        }
                    })
                    .catch(() => {});
            }

            if (rolSeguro === "Técnico") {
                Promise.all([
                    fetch(`${API_URL}/api/ordenes_de_servicio/listar`, {
                        headers: { Authorization: `Bearer ${tokenSeguro}` }
                    }).then(r => r.json()),
                    fetch(`${API_URL}/api/pre_revision/listar`, {
                        headers: { Authorization: `Bearer ${tokenSeguro}` }
                    }).then(r => r.json())
                ]).then(([ordenes, preRevisiones]) => {
                    const ordenesAsignadas = Array.isArray(ordenes)
                        ? ordenes.filter(o => o.nombre_estado === "ASIGNADA").length
                        : 0;
                    const preRevisionesPendientes = Array.isArray(preRevisiones)
                        ? preRevisiones.filter(p => p.estado === "PENDIENTE").length
                        : 0;

                    if (ordenesAsignadas > 0) {
                        mostrarToast(`Tienes ${ordenesAsignadas} orden(es) de servicio asignada(s).`, "info");
                    }
                    if (preRevisionesPendientes > 0) {
                        mostrarToast(`Tienes ${preRevisionesPendientes} pre-revisión(es) pendiente(s).`, "info");
                    }
                }).catch(() => {});
            }

            mostrarToast("¡Bienvenido! Iniciando sesión...", "success");
            setTimeout(() => navigate("/panel"), 1500);

        } catch (error) {
            console.error(error);
            mostrarToast("Error en el servidor", "error");
            setCargando(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-left">
                <div className="login-left-content">
                    <img src="/logo.jpg" alt="Rocket Service" className="login-logo" />
                    <h1 className="login-brand">Rocket Service</h1>
                    <p className="login-slogan">Gestiona tu taller de motos de forma inteligente</p>

                    <div className="login-features">
                        <div className="login-feature-item">
                            <i className="fa-solid fa-motorcycle"></i>
                            <span>Control de motocicletas</span>
                        </div>
                        <div className="login-feature-item">
                            <i className="fa-solid fa-screwdriver-wrench"></i>
                            <span>Gestión de órdenes de servicio</span>
                        </div>
                        <div className="login-feature-item">
                            <i className="fa-solid fa-users"></i>
                            <span>Administración de técnicos</span>
                        </div>
                        <div className="login-feature-item">
                            <i className="fa-solid fa-chart-line"></i>
                            <span>Seguimiento en tiempo real</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-container">
                    <h2 className="login-title">Iniciar Sesión</h2>
                    <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label className="login-label" htmlFor="login-usuario">
                                <i className="fa-solid fa-envelope me-2"></i>Correo electrónico
                            </label>
                            <input
                                id="login-usuario"
                                className={`login-input ${errores.usuario ? "login-input-error" : ""}`}
                                type="email"
                                name="usuario"
                                value={form.usuario}
                                placeholder="correo@ejemplo.com"
                                onChange={(e) => {
                                    handleChange(e);
                                    setErrores(prev => ({ ...prev, usuario: false }));
                                }}
                            />
                            {errores.usuario && (
                                <small className="login-error-msg">
                                    <i className="fa-solid fa-circle-exclamation me-1"></i>
                                    {mensajesInvisibles.usuario}
                                </small>
                            )}
                        </div>

                        <div className="login-field">
                            <label className="login-label" htmlFor="login-contrasena">
                                <i className="fa-solid fa-lock me-2"></i>Contraseña
                            </label>
                            
                            <div style={{ position: "relative", width: "100%", display: "block" }}>
                                <input
                                    id="login-contrasena"
                                    className={`login-input ${errores.contrasena ? "login-input-error" : ""}`}
                                    type={mostrarContrasena ? "text" : "password"}
                                    name="contrasena"
                                    maxLength={20}
                                    value={form.contrasena}
                                    placeholder="••••••••"
                                    onChange={(e) => {
                                        handleChange(e);
                                        setErrores(prev => ({ ...prev, contrasena: false }));
                                    }}
                                    style={{ paddingRight: "40px", width: "100%", boxSizing: "border-box" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarContrasena(prev => !prev)}
                                    tabIndex="-1"
                                    aria-label="Alternar visibilidad de la contraseña"
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        padding: "0",
                                        margin: "0",
                                        cursor: "pointer",
                                        color: "#6b7280",
                                        fontSize: "1rem",
                                        zIndex: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <i className={`fa-solid ${mostrarContrasena ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>

                            {errores.contrasena && (
                                <small className="login-error-msg">
                                    <i className="fa-solid fa-circle-exclamation me-1"></i>
                                    {mensajesInvisibles.contrasena}
                                </small>
                            )}
                        </div>

                        <div className="login-forgot">
                            <a href="forgotPassword" className="login-link">¿Olvidaste tu contraseña?</a>
                        </div>

                        <button className="login-btn" disabled={cargando}>
                            {cargando
                                ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Iniciando...</>
                                : <><i className="fa-solid fa-right-to-bracket me-2"></i>Iniciar Sesión</>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Iniciarsesion;