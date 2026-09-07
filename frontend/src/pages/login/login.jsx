import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './login.css';
// import GoogleButton from "../../components/btnLogin/googleButton";
import { useToast } from "../../context/ToastContext";

function Iniciarsesion() {
    const navigate = useNavigate();
    const { mostrarToast } = useToast();

    const [form, setForm] = useState({ usuario: "", contrasena: "" });
    const [errores, setErrores] = useState({ usuario: false, contrasena: false });
    const [cargando, setCargando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.usuario === "" || form.contrasena === "") {
            setErrores({
                usuario: form.usuario === "",
                contrasena: form.contrasena === ""
            });
            mostrarToast("Por favor completa todos los campos", "warning");
            return;
        }
        setErrores({ usuario: false, contrasena: false });
        setCargando(true);

        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
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
                fetch("http://localhost:4000/api/insumos/stock-bajo", {
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

                fetch("http://localhost:4000/api/pre_revision/pendientes-orden", {
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

                fetch("http://localhost:4000/api/notificaciones/pendientes-admin", {
                    headers: { Authorization: `Bearer ${tokenSeguro}` }
                })
                    .then(res => res.json())
                    .then(notifs => {
                        if (Array.isArray(notifs) && notifs.length > 0) {
                            notifs.forEach(n => mostrarToast(n.mensaje, "warning"));
                            fetch("http://localhost:4000/api/notificaciones/marcar-leidas", {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${tokenSeguro}` }
                            }).catch(() => {});
                        }
                    })
                    .catch(() => {});
            }

            if (rolSeguro === "Técnico") {
                Promise.all([
                    fetch("http://localhost:4000/api/ordenes_de_servicio/listar", {
                        headers: { Authorization: `Bearer ${tokenSeguro}` }
                    }).then(r => r.json()),
                    fetch("http://localhost:4000/api/pre_revision/listar", {
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
            {/* Lado izquierdo */}
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

            {/* Lado derecho */}
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
                                type="text"
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
                                    Este campo es obligatorio
                                </small>
                            )}
                        </div>

                        <div className="login-field">
                            <label className="login-label" htmlFor="login-contrasena">
                                <i className="fa-solid fa-lock me-2"></i>Contraseña
                            </label>
                            <div style={{ position: "relative", width: "100%" }}>
                                <input
                                    id="login-contrasena"
                                    className={`login-input ${errores.contrasena ? "login-input-error" : ""}`}
                                    type={mostrarContrasena ? "text" : "password"}
                                    name="contrasena"
                                    value={form.contrasena}
                                    placeholder="••••••••"
                                    style={{ paddingRight: "40px" }}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setErrores(prev => ({ ...prev, contrasena: false }));
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6b7280"
                                    }}
                                    tabIndex={-1}
                                >
                                    <i className={`fa-solid ${mostrarContrasena ? "fa-eye" : "fa-eye-slash"}`}></i>
                                </button>
                            </div>
                            {errores.contrasena && (
                                <small className="login-error-msg">
                                    <i className="fa-solid fa-circle-exclamation me-1"></i>
                                    Este campo es obligatorio
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