import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../../axiosConfig";
import { useToast } from "../../context/ToastContext";
import { FormValidators } from '@rocket/shared';
import TokenInput from "../../components/TokenInput/TokenInput";
import '../../components/TokenInput/TokenInput.css';
import '../../pages/register/register.css';

function Registro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mostrarToast } = useToast();

  const correoUrl = searchParams.get("correo") || searchParams.get("correo_usuario") || "";

  const [form, setForm] = useState({
    tokenRegistro: "", // Vacío para que el técnico lo digite manualmente
    contrasena: "",
    confirmarContrasena: "",
    nombre: "",
    apellido: "",
    correo_usuario: correoUrl.trim(),
    telefono_usuario: "",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [validandoInicial, setValidandoInicial] = useState(true);
  const [invalido, setInvalido] = useState(false);
  const [mensajeInvalido, setMensajeInvalido] = useState("");

  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

  // Reglas de contraseña
  const regLongitud = form.contrasena.length >= 8;
  const regMayus = /[A-Z]/.test(form.contrasena);
  const regMinus = /[a-z]/.test(form.contrasena);
  const regNum = /[0-9]/.test(form.contrasena);
  const regEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.contrasena);
  const esContrasenaValida = regLongitud && regMayus && regMinus && regNum && regEspecial;

  // Verificación en Backend
  const verificarEstadoInvitacion = async (correo) => {
    if (!correo || !FormValidators.esEmailValido(correo)) {
      return false;
    }

    try {
      const res = await axios.get(`http://localhost:4000/api/auth/validar-codigo-tecnico?correo_usuario=${encodeURIComponent(correo)}`);

      if (res.data && res.data.valido) {
        setInvalido(false);
        setMensajeInvalido("");
        return true;
      } else {
        setInvalido(true);
        setMensajeInvalido(res.data?.message || "La invitación no es válida o ya ha sido utilizada.");
        return false;
      }
    } catch (error) {
      setInvalido(true);
      const msg = error.response?.data?.message || "La invitación ha expirado o el enlace no es válido.";
      setMensajeInvalido(msg);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      // Limpia los parámetros visibles (?correo=...) de la pestaña/barra de direcciones al cargar
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (form.correo_usuario) {
        await verificarEstadoInvitacion(form.correo_usuario);
      }
      setValidandoInicial(false);
    };
    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;

    if (name === "nombre" || name === "apellido") {
      valorFormateado = FormValidators.normalizarNombreCompleto(value);
    } else if (name === "telefono_usuario") {
      valorFormateado = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: valorFormateado }));
    setErrores((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const correoLimpio = form.correo_usuario.trim();

    const nuevosErrores = {
      tokenRegistro: !form.tokenRegistro || form.tokenRegistro.length < 6,
      contrasena: !form.contrasena || !esContrasenaValida,
      confirmarContrasena: !form.confirmarContrasena,
      nombre: !form.nombre.trim() || !FormValidators.esSoloLetras(form.nombre.trim()),
      apellido: !form.apellido.trim() || !FormValidators.esSoloLetras(form.apellido.trim()),
      correo_usuario: !correoLimpio || !FormValidators.esEmailValido(correoLimpio),
      telefono_usuario: !form.telefono_usuario.trim() || !FormValidators.esTelefonoValido(form.telefono_usuario),
    };

    if (Object.values(nuevosErrores).some((esError) => esError)) {
      setErrores(nuevosErrores);
      mostrarToast("Completa todos los campos correctamente.", "warning");
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      setErrores((prev) => ({ ...prev, contrasena: true, confirmarContrasena: true }));
      mostrarToast("Las contraseñas no coinciden.", "warning");
      return;
    }

    // Re-verificar la invitación antes de procesar
    const esValido = await verificarEstadoInvitacion(correoLimpio);
    if (!esValido) return;

    setCargando(true);

    try {
      const response = await axios.post("http://localhost:4000/api/auth/register", {
        ...form,
        correo_usuario: correoLimpio
      });

      mostrarToast(response.data.message || "Técnico activado con éxito.", "success");
      setTimeout(() => navigate("/panel/orders"), 1500);

    } catch (error) {
      const msg = error.response?.data?.message || "Código de activación incorrecto o expirado.";
      const status = error.response?.status;

      if (status === 400 || status === 401 || status === 404) {
        setInvalido(true);
        setMensajeInvalido(msg);
      } else {
        mostrarToast(msg, "error");
        setErrores((prev) => ({ ...prev, tokenRegistro: true }));
      }
    } finally {
      setCargando(false);
    }
  };

  if (validandoInicial) {
    return (
      <div className="register-container">
        <div className="register-form-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '36px', color: '#1a1a2e' }}></i>
          <p style={{ marginTop: '16px', color: '#4b5563', fontSize: '14px' }}>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (invalido) {
    return (
      <div className="register-container">
        <div className="register-form-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', color: '#dc2626', marginBottom: '16px' }}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h2 className="register-title" style={{ color: '#1a1a2e' }}>Enlace de registro no válido</h2>
          <p className="register-subtitle" style={{ color: '#4b5563', margin: '12px 0 24px' }}>
            {mensajeInvalido}
          </p>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#991b1b'
          }}>
            <i className="fa-solid fa-circle-info me-2"></i>
            Solicita al administrador un nuevo enlace de activación.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Registro de Técnico</h2>
        <p className="register-subtitle">Ingresa tus datos de perfil y el código de activación enviado a tu correo</p>

        <form onSubmit={handleSubmit}>
          {/* Nombres y Apellidos */}
          <div className="register-row">
            <div className="register-field">
              <label className="register-label"><i className="fa-solid fa-user me-1"></i>Nombre</label>
              <input
                className={`register-input ${errores.nombre ? "register-input-error" : ""}`}
                type="text" name="nombre" placeholder="Ej: Juan"
                value={form.nombre} onChange={handleChange} maxLength={50}
              />
              {errores.nombre && <small className="register-error-msg">Ingresa un nombre válido</small>}  
            </div>

            <div className="register-field">
              <label className="register-label"><i className="fa-solid fa-user me-1"></i>Apellido</label>
              <input
                className={`register-input ${errores.apellido ? "register-input-error" : ""}`}
                type="text" name="apellido" placeholder="Ej: Hernández"
                value={form.apellido} onChange={handleChange} maxLength={50}
              />
              {errores.apellido && <small className="register-error-msg">Ingresa un apellido válido</small>}  
            </div> 
          </div>
           
          {/* Correo y Teléfono */}  
          <div className="register-row">
            <div className="register-field">
              <label className="register-label"><i className="fa-solid fa-envelope me-2"></i>Correo electrónico</label>
              <input
                className={`register-input ${errores.correo_usuario ? "register-input-error" : ""}`}
                type="email" name="correo_usuario" value={form.correo_usuario}
                placeholder="correo@ejemplo.com" onChange={handleChange}
                onBlur={() => verificarEstadoInvitacion(form.correo_usuario)}
              />
              {errores.correo_usuario && <small className="register-error-msg">Correo no válido</small>}
            </div>
              
            <div className="register-field">
              <label className="register-label"><i className="fa-solid fa-phone me-1"></i>Teléfono</label>
              <input
                className={`register-input ${errores.telefono_usuario ? "register-input-error" : ""}`}
                type="tel" name="telefono_usuario" value={form.telefono_usuario}
                placeholder="3001234567" onChange={handleChange} maxLength={10}
              />
              {errores.telefono_usuario && <small className="register-error-msg">Teléfono de 10 dígitos requerido</small>}
            </div>
          </div>

          {/* Contraseñas */}
          <div className="register-row">
            <div className="register-field">
              <label className="register-label"><i className="fa-solid fa-lock me-2"></i>Contraseña</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  className={`register-input ${errores.contrasena ? "register-input-error" : ""}`}
                  type={mostrarContrasena ? "text" : "password"}
                  name="contrasena" autoComplete="new-password" placeholder="••••••••"
                  value={form.contrasena} onChange={handleChange} style={{ paddingRight: "40px" }}
                />  
                <button
                  type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${mostrarContrasena ? "fa-eye" : "fa-eye-slash"}`}></i>
                </button>
              </div>

              {form.contrasena && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#555' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
                    <span style={{ color: regLongitud ? '#28a745' : '#dc3545' }}>{regLongitud ? '✓' : '✗'} Mín. 8 caracteres</span>
                    <span style={{ color: regMayus ? '#28a745' : '#dc3545' }}>{regMayus ? '✓' : '✗'} Una Mayúscula</span>
                    <span style={{ color: regMinus ? '#28a745' : '#dc3545' }}>{regMinus ? '✓' : '✗'} Una Minúscula</span>
                    <span style={{ color: regNum ? '#28a745' : '#dc3545' }}>{regNum ? '✓' : '✗'} Un Número</span>
                    <span style={{ color: regEspecial ? '#28a745' : '#dc3545', gridColumn: 'span 2' }}>{regEspecial ? '✓' : '✗'} Carácter especial</span>
                  </div>
                </div>
              )}
            </div>

            <div className="register-field">
              <label className="register-label"><i className="fa-solid fa-lock me-2"></i>Confirmar contraseña</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input 
                  className={`register-input ${errores.confirmarContrasena ? "register-input-error" : ""}`}
                  type={mostrarConfirmarContrasena ? "text" : "password"}
                  name="confirmarContrasena" autoComplete="new-password" placeholder="••••••••"
                  value={form.confirmarContrasena} onChange={handleChange} style={{ paddingRight: "40px" }}
                />  
                <button
                  type="button" onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${mostrarConfirmarContrasena ? "fa-eye" :"fa-eye-slash"}`}></i>
                </button>
              </div>
              {errores.confirmarContrasena && <small className="register-error-msg">Las contraseñas no coinciden</small>}  
            </div>
          </div>
          
          {/* Código de Activación */}
          <div className="register-field" style={{ width: "100%" }}>
            <label className="register-label" style={{ textAlign: "center", display: "block" }}>
              <i className="fa-solid fa-key me-2"></i>Código de Activación (6 dígitos)
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
                Código numérico de 6 dígitos requerido
              </small>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={cargando}>
            {cargando
              ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Completando registro...</>
              : <><i className="fa-solid fa-user-check me-2"></i>Completar Registro</>
            }
          </button>
        </form>
      </div>    
    </div>  
  );
}

export default Registro;