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

            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem("token", data.token);
            localStorage.setItem("rol", payload.role);
            localStorage.setItem("userId", payload.id);
            window.dispatchEvent(new CustomEvent('authChanged'));

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
                            <label className="login-label">
                                <i className="fa-solid fa-envelope me-2"></i>Correo electrónico
                            </label>
                            <input
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
                            <label className="login-label">
                                <i className="fa-solid fa-lock me-2"></i>Contraseña
                            </label>
                            <input
                                className={`login-input ${errores.contrasena ? "login-input-error" : ""}`}
                                type="password"
                                name="contrasena"
                                value={form.contrasena}
                                placeholder="••••••••"
                                onChange={(e) => {
                                    handleChange(e);
                                    setErrores(prev => ({ ...prev, contrasena: false }));
                                }}
                            />
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

                        <div className="login-register">
                            <span>¿Primera vez en Rocket? </span>
                            <Link to="/register" className="login-link">Registrarme</Link>
                        </div>

                        {/* <div className="login-divider">
                            <span>o continúa con</span>
                        </div>

                        <div className="login-google">
                            <GoogleButton />
                        </div> */}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Iniciarsesion;