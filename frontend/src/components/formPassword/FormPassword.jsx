import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';
import '../../components/formPassword/formPassword.css';

function FormPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const token = searchParams.get('token');

  const [form, setForm] = useState({
    contrasena: '',
    confirmarContrasena: '',
  });

  const [errores, setErrores] = useState({
    contrasena: false,
    confirmarContrasena: false,
  });

  const [cargando, setCargando] = useState(false);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  // Validar si viene el token en la URL
  useEffect(() => {
    if (!token) {
      setTokenInvalido(true);
      setMensajeEstado('Enlace no válido. Por favor verifica el correo enviado por el administrador.');
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.contrasena !== form.confirmarContrasena) {
      setErrores({ contrasena: true, confirmarContrasena: true });
      mostrarToast('Las contraseñas no coinciden, deben ser idénticas', 'warning');
      return;
    }

    if (!form.contrasena || !form.confirmarContrasena) {
      setErrores({
        contrasena: form.contrasena === '',
        confirmarContrasena: form.confirmarContrasena === '',
      });
      mostrarToast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (form.contrasena.length < 8) {
      setErrores({ contrasena: true, confirmarContrasena: false });
      mostrarToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      return;
    }

    setErrores({ contrasena: false, confirmarContrasena: false });
    setCargando(true);

    try {
      const response = await axios.post('http://localhost:4000/api/auth/establecer-contrasena-cliente', {
        token,
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
            <button 
              className="register-btn"
              onClick={() => navigate('/')}
            >
              <i className="fa-solid fa-right-to-bracket me-2"></i>Ir al Inicio de Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Input contraseña y confirmar contraseña */}
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
                  <i className="fa-solid fa-lock me-2"></i>Confirmar Contraseña
                </label>

                <input 
                  className={`register-input ${errores.confirmarContrasena ? "register-input-error" : ""}`}
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