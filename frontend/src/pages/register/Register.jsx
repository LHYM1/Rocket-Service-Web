import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import './register.css'

function Registro() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [form, setForm] = useState({
    contrasena: "",
    confirmarContrasena: "",
    nombre: "",
    apellido: "",
    correo_usuario: "",
    telefono_usuario: "",
  });

  const [errores, setErrores] = useState({
    contrasena: false,
    confirmarContrasena: false,
    nombre: false,
    apellido: false,
    correo_usuario: false,
    telefono_usuario: false,    
  })

  const [cargando, setCargando] = useState(false);
  const [verificandoCorreo, setVerificandoCorreo] = useState(false);
  const [correoDisponible, setCorreoDisponible] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    if (!form.correo_usuario) {
      setCorreoDisponible(false)
      return;
    }

    const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo_usuario);
    if (!formatoValido) {
      setCorreoDisponible(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setVerificandoCorreo(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/auth/check-email?correo_usuario=${encodeURIComponent(form.correo_usuario)}`
        );
        
        const data = await response.json();

        // Si en la data (DB) hay un correo igual no mostrar mensaje de correo disponible
        if (data.exists) {
          setErrores(prev => ({...prev, correo_usuario: true }));
          setCorreoDisponible(false);

          // si no hay duplicidad de correo
        } else {
          setCorreoDisponible(true);
        }
      } catch (error) {
        console.error("Error al verificar correo:", error)
      } finally {
        setVerificandoCorreo(false);
      }  
    }, 600);
    
    return () => clearTimeout(timeoutId);
  }, [form.correo_usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.contrasena !== form.confirmarContrasena) {
      setErrores(prev => ({ ...prev, contrasena: true, confirmarContrasena: true }));
      mostrarToast("Las contraseñas no coinciden, deben ser identicas", "warning");
      return;
    }

    // Validación básica
    if (!form.contrasena || !form.confirmarContrasena || !form.nombre || !form.apellido 
      || !form.correo_usuario || !form.telefono_usuario) {

      setErrores({
        contrasena: form.contrasena === "",
        confirmarContrasena: form.confirmarContrasena === "",
        nombre: form.nombre === "",
        apellido: form.apellido === "",
        correo_usuario: form.correo_usuario === "",
        telefono_usuario: form.telefono_usuario === "",
      })
      mostrarToast("Por favor completa todos los campos", "warning");
      return;
    }

    setErrores({
      contrasena: false,
      confirmarContrasena: false,
      nombre: false,
      apellido: false,
      correo_usuario: false,
      telefono_usuario: false,  
    })

    setCargando(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Imprimimos mensaje de error email duplicado (viene del backend)
          setErrores(prev => ({...prev, correo_usuario: true }));
        }
        mostrarToast(data.message || "Error al registrarse", "error");
        setForm({ ...form, contrasena: "", confirmarContrasena: "" });
        setCargando(false);
        return;
      }

      mostrarToast("¡Registro exitoso! Ahora inicia sesión..", "success");
      setTimeout(() => navigate("/"), 1500); // Redirigir al login

    } catch (error) {
      console.error(error);
      mostrarToast("Error en el servidor", "error");
      setCargando(false);
    };
  }  

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Registro de Técnicos</h2>
        <p className="register-subtitle">Registra tus datos para continuar</p>

        <form onSubmit={handleSubmit}>
         {/* Fila nombre y apellido */}
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-user"></i>Nombre 
              </label>
                
              <input
                className={`register-input ${errores.nombre ? "register-input-error" : ""}`}
                type="text" 
                name="nombre" 
                placeholder="primer nombre ej: Juan"
                value={form.nombre}
                onChange={(e) => {
                  handleChange(e);
                  setErrores(prev => ({ ...prev, nombre: false }));
                }}
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
                <i className="fa-solid fa-user"></i>Apellido
              </label>
                    
              <input
                className={`register-input ${errores.apellido ? "register-input-error" : ""}`}
                type="text" 
                name="apellido" 
                placeholder="Primer apellido ej: Hernández"
                value={form.apellido}
                onChange={(e) => {
                  handleChange(e);
                  setErrores(prev => ({ ...prev, apellido: false }));
                }}
              />
              {errores.apellido && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                    Este campo es obligatorio
                </small>
              )}  
            </div> 
          </div>
           
          {/* Correo electrónico y teléfono */}  
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-envelope me-2"></i>Correo electrónico
                {verificandoCorreo && (
                  <span className="register-checking-msg">Verificando...</span>
                )}
              </label>

              <input
                className={`
                  register-input ${errores.correo_usuario ? "register-input-error" : ""}
                  ${correoDisponible ? "register-input-success" : ""}
                }`}
                type="email"
                name="correo_usuario"
                value={form.correo_usuario}
                placeholder="correo@ejemplo.com"
                onChange={(e) => {
                  handleChange(e);
                  setErrores(prev => ({ ...prev, correo_usuario: false }));
                  setCorreoDisponible(false);
                }}
              />

              {errores.correo_usuario && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                    {form.correo_usuario ? "Este correo ya está registrado. Ingresa otro" : "Este campo es obligatorio"}
                </small>
              )}

              {!errores.correo_usuario && correoDisponible && (
                <small className="register-success.msg">
                  <span className="fa-stack fa-check-stack">
                    <i className="fa-solid fa-circle fa-stack-2x check-circle-bg"></i>
                    <i className="fa-solid fa-check fa-stack-1x check-icon-fg"></i>
                  </span>  
                  Correo disponible
                </small>
              )}
            </div>
              
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-phone"></i>Teléfono
              </label>

              <input
                className={`register-input ${errores.telefono_usuario ? "register-input-error" : ""}`}
                type="tel"
                name="telefono_usuario"
                value={form.telefono_usuario}
                placeholder="3225676534"
                onChange={(e) => {
                  handleChange(e);
                  setErrores(prev => ({ ...prev, telefono_usuario: false }));
                }}
              />

              {errores.telefono_usuario && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                    Este campo es obligatorio
                </small>
              )}
            </div>
          </div>

          {/* input contraseña y confirmar contraseña*/}
          <div className="register-row">
            <div className="register-field">
              <label className="register-label">
                <i className="fa-solid fa-lock me-2"></i>Contraseña
              </label>

              <input 
                className={`register-input ${errores.contrasena ? 
                "register-input-error" : ""}`}
                type="password"
                name="contrasena"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.contrasena}
                onChange={(e) => {
                  handleChange(e);
                  setErrores(prev => ({ ...prev, contrasena: false }));
                }}
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
                <i className="fa-solid fa-lock me-2"></i>confirmar contraseña
              </label>

              <input 
                className={`register-input ${errores.confirmarContrasena ? 
                "register-input-error" : ""}`}
                type="password"
                name="confirmarContrasena"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmarContrasena}
                onChange={(e) => {
                  handleChange(e);
                  setErrores(prev => ({ ...prev, confirmarContrasena: false }));
                }}
              />  
              {errores.confirmarContrasena && (
                <small className="register-error-msg">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                    Este campo es obligatorio
                </small>
              )}  
            </div>

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
