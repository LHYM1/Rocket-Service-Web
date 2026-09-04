import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import TokenInput from "../../components/TokenInput/TokenInput";
import '../../components/TokenInput/TokenInput.css';
import './register.css';

function Registro() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [form, setForm] = useState({
    tokenRegistro: "",
    contrasena: "",
    confirmarContrasena: "",
    nombre: "",
    apellido: "",
    correo_usuario: "",
    telefono_usuario: "",
  });

  const [errores, setErrores] = useState({
    tokenRegistro: false,
    contrasena: false,
    confirmarContrasena: false,
    nombre: false,
    apellido: false,
    correo_usuario: false,
    telefono_usuario: false,    
  });

  const [cargando, setCargando] = useState(false);

  // EFECTO PARA OCULTAR EL TOKEN DE LA URL AL CARGAR LA PÁGINA
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenUrl = searchParams.get("token");

    if (tokenUrl) {
      // 1. Guardar el token extraído de la URL en el estado interno del formulario
      setForm((prev) => ({ ...prev, tokenRegistro: tokenUrl }));

      // 2. Ocultar y remover el parámetro "?token=..." de la barra de direcciones de inmediato
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrores((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Verificar campos obligatorios
    const nuevosErrores = {
      tokenRegistro: !form.tokenRegistro,
      contrasena: !form.contrasena,
      confirmarContrasena: !form.confirmarContrasena,
      nombre: !form.nombre.trim(),
      apellido: !form.apellido.trim(),
      correo_usuario: !form.correo_usuario.trim(),
      telefono_usuario: !form.telefono_usuario.trim(),
    };

    if (Object.values(nuevosErrores).some((esError) => esError)) {
      setErrores(nuevosErrores);
      mostrarToast("Por favor completa todos los campos obligatorios", "warning");
      return;
    }

    // 2. Verificar coincidencia de contraseñas
    if (form.contrasena !== form.confirmarContrasena) {
      setErrores((prev) => ({ ...prev, contrasena: true, confirmarContrasena: true }));
      mostrarToast("Las contraseñas no coinciden, deben ser idénticas", "warning");
      return;
    }

    setCargando(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          setErrores((prev) => ({ ...prev, tokenRegistro: true, correo_usuario: true }));
        }
        mostrarToast(data.message || "Error al registrarse", "error");
        setForm((prev) => ({ ...prev, contrasena: "", confirmarContrasena: "" }));
        setCargando(false);
        return;
      }

      mostrarToast("¡Registro exitoso! Ahora inicia sesión...", "success");
      setTimeout(() => navigate("/"), 1500);

    } catch (error) {
      console.error(error);
      mostrarToast("Error en el servidor al intentar registrar", "error");
      setCargando(false);
    }
  };  

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Registro de Técnicos</h2>
        <p className="register-subtitle">Registra tus datos para continuar</p>

        <form onSubmit={handleSubmit}>
          {/* Fila Nombre y Apellido */}
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-user me-1"></i>Nombre 
              </label>
                
              <input
                className={`register-input ${errores.nombre ? "register-input-error" : ""}`}
                type="text" 
                name="nombre" 
                placeholder="Primer nombre ej: Juan"
                value={form.nombre}
                onChange={handleChange}
              />
              {errores.nombre && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Este campo es obligatorio
                </small>
              )}  
            </div>

            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-user me-1"></i>Apellido
              </label>
                    
              <input
                className={`register-input ${errores.apellido ? "register-input-error" : ""}`}
                type="text" 
                name="apellido" 
                placeholder="Primer apellido ej: Hernández"
                value={form.apellido}
                onChange={handleChange}
              />
              {errores.apellido && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Este campo es obligatorio
                </small>
              )}  
            </div> 
          </div>
           
          {/* Correo Electrónico y Teléfono */}  
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-envelope me-2"></i>Correo electrónico
              </label>

              <input
                className={`register-input ${errores.correo_usuario ? "register-input-error" : ""}`}
                type="email"
                name="correo_usuario"
                value={form.correo_usuario}
                placeholder="correo@ejemplo.com"
                onChange={handleChange}
              />

              {errores.correo_usuario && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Ingresa el correo al que fue enviada tu activación
                </small>
              )}
            </div>
              
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-phone me-1"></i>Teléfono
              </label>

              <input
                className={`register-input ${errores.telefono_usuario ? "register-input-error" : ""}`}
                type="tel"
                name="telefono_usuario"
                value={form.telefono_usuario}
                placeholder="3225676534"
                onChange={handleChange}
              />

              {errores.telefono_usuario && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Este campo es obligatorio
                </small>
              )}
            </div>
          </div>

          {/* Contraseña y Confirmar Contraseña */}
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-lock me-2"></i>Contraseña
              </label>

              <input 
                className={`register-input ${errores.contrasena ? "register-input-error" : ""}`}
                type="password"
                name="contrasena"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.contrasena}
                onChange={handleChange}
              />  
              {errores.contrasena && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Este campo es obligatorio
                </small>
              )}  
            </div>

            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-lock me-2"></i>Confirmar contraseña
              </label>

              <input 
                className={`register-input ${errores.confirmarContrasena ? "register-input-error" : ""}`}
                type="password"
                name="confirmarContrasena"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmarContrasena}
                onChange={handleChange}
              />  

              {errores.confirmarContrasena && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Este campo es obligatorio
                </small>
              )}  
            </div>
          </div>
          
          {/* Campo / Input del Token */}
          <div className="register-field" style={{ width: "100%" }}>
            <label className="register-label" style={{ textAlign: "center", display: "block" }}>
              <i className="fa-solid fa-key me-2"></i>Código de Activación
            </label>

            <TokenInput
              value={form.tokenRegistro}
              onChange={(newToken) => {
                setForm((prev) => ({ ...prev, tokenRegistro: newToken }));
                setErrores((prev) => ({ ...prev, tokenRegistro: false }));
              }}
              error={errores.tokenRegistro}
            />

            {errores.tokenRegistro && (
              <small className="register-error-msg" style={{ textAlign: "center", display: "block" }}>
                <i className="fa-solid fa-circle-exclamation me-1"></i>
                Ingresa el código de activación válido
              </small>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={cargando}>
            {cargando
              ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Registrando...</>
              : <><i className="fa-solid fa-user-plus me-2"></i>Registrarme</>
            }
          </button>
        </form>
      </div>    
    </div>  
  );
}

export default Registro;