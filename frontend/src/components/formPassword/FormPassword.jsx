import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';
import '../../components/formPassword/formPassword.css';

function FormPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [tokenOculto, setTokenOculto] = useState('');
  const [form, setForm] = useState({
    contrasena: '',
    confirmarContrasena: '',
  });

  const [errores, setErrores] = useState({
    contrasena: false,
    confirmarContrasena: false,
  });

  const [cargando, setCargando] = useState(false);
  const [verificandoToken, setVerificandoToken] = useState(true);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  // Validar token contra el servidor al cargar el componente
  useEffect(() => {
    const tokenUrl = searchParams.get('token');
    const tokenActual = tokenUrl || tokenOculto;

    if (!tokenActual) {
      setTokenInvalido(true);
      setMensajeEstado('Enlace no válido. Por favor verifica el correo enviado por el sistema.');
      setVerificandoToken(false);
      return;
    }

    setTokenOculto(tokenActual);

    if (tokenUrl) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const verificarTokenEnBackend = async () => {
      try {
        // RUTA CORREGIDA: Apunta exactamente a /api/auth con barra inicial /
        const res = await axios.get(`http://localhost:4000/api/auth/validar-token-cliente/${tokenActual}`);
        if (res.data.valido) {
          setTokenInvalido(false);
        }
      } catch (error) {
        setTokenInvalido(true);
        setMensajeEstado(
          error.response?.data?.message || 'El enlace ha expirado o ya fue utilizado.'
        );
      } finally {
        setVerificandoToken(false);
      }
    };

    verificarTokenEnBackend();
  }, [searchParams]);

  const regLongitud = form.contrasena.length >= 8;
  const regMayus = /[A-Z]/.test(form.contrasena);
  const regMinus = /[a-z]/.test(form.contrasena);
  const regNum = /[0-9]/.test(form.contrasena);
  const regEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.contrasena);

  const esContrasenaValida = regLongitud && regMayus && regMinus && regNum && regEspecial;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!esContrasenaValida) {
      setErrores((prev) => ({ ...prev, contrasena: true }));
      mostrarToast('La contraseña no cumple con los requisitos de seguridad', 'warning');
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      setErrores({ contrasena: true, confirmarContrasena: true });
      mostrarToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    setErrores({ contrasena: false, confirmarContrasena: false });
    setCargando(true);

    try {
      // Enviar datos al backend 
      const response = await axios.post('http://localhost:4000/api/auth/establecer-contrasena-cliente', {
        token: tokenOculto,
        contrasena: form.contrasena
      });

      mostrarToast('¡Contraseña establecida con éxito!', 'success');

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || 'Error al procesar la solicitud';

      if (status === 401 || status === 400) {
        setTokenInvalido(true);
        setMensajeEstado(msg);
      } else {
        mostrarToast(msg, 'error');
      }
    } finally {
      setCargando(false);
    }
  };

  if (verificandoToken) {
    return (
      <div className="register-container">
        <div className="register-form-container" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#1a1a2e' }}></i>
          <p style={{ marginTop: '15px', color: '#666' }}>Verificando validez del enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Establecer Contraseña</h2>
        <p className="register-subtitle">Crea tu nueva contraseña para activar tu cuenta</p>

        {tokenInvalido ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', color: '#dc3545', marginBottom: '15px' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '10px' }}>Enlace expirado o no válido</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>{mensajeEstado}</p>
            
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="register-row">
              <div className="register-field">
                <label className="register-label">
                  <i className="fa-solid fa-lock me-2"></i>Nueva Contraseña
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

                {form.contrasena && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#555' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
                      <span style={{ color: regLongitud ? '#28a745' : '#dc3545' }}>
                        {regLongitud ? '✓' : '✗'} Mínimo 8 caracteres
                      </span>
                      <span style={{ color: regMayus ? '#28a745' : '#dc3545' }}>
                        {regMayus ? '✓' : '✗'} Una Mayúscula
                      </span>
                      <span style={{ color: regMinus ? '#28a745' : '#dc3545' }}>
                        {regMinus ? '✓' : '✗'} Una Minúscula
                      </span>
                      <span style={{ color: regNum ? '#28a745' : '#dc3545' }}>
                        {regNum ? '✓' : '✗'} Un Número
                      </span>
                      <span style={{ color: regEspecial ? '#28a745' : '#dc3545', gridColumn: 'span 2' }}>
                        {regEspecial ? '✓' : '✗'} Carácter especial (@,#,$,etc)
                      </span>
                    </div>
                  </div>
                )}

                {errores.contrasena && !form.contrasena && (
                  <small className="register-error-msg">
                    <i className="fa-solid fa-circle-exclamation me-1"></i>
                    Este campo es obligatorio
                  </small>
                )}  
              </div>

              <div className="register-field">
                <label className="register-label">
                  <i className="fa-solid fa-lock me-2"></i>Confirmar Contraseña
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
                    Las contraseñas deben coincidir
                  </small>
                )}  
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={cargando}>
              {cargando
                ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Guardando...</>
                : <><i className="fa-solid fa-key me-2"></i>Guardar y Acceder</>
              }
            </button>
          </form>
        )}
      </div>    
    </div>  
  );
}

export default FormPassword;