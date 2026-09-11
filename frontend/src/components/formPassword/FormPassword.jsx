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
  const [paso, setPaso] = useState(1); // 1 = contraseña, 2 = datos de la moto
  const [animando, setAnimando] = useState(false);

  const [form, setForm] = useState({
    contrasena: '',
    confirmarContrasena: '',
  });

  const [moto, setMoto] = useState({
    placa: '',
    id_modelo: '',
    kilometraje_actual: '',
  });
  const [agregandoModeloNuevo, setAgregandoModeloNuevo] = useState(false);
  const [nombreModeloNuevo, setNombreModeloNuevo] = useState('');

  const [modelos, setModelos] = useState([]);

  const [errores, setErrores] = useState({
    contrasena: false,
    confirmarContrasena: false,
  });
  const [erroresMoto, setErroresMoto] = useState({});

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
        const res = await axios.get(`/api/auth/validar-token-cliente/${tokenActual}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Cargar los modelos de motocicleta disponibles, para el paso 2
  useEffect(() => {
    axios.get("/api/modelo/listar")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setModelos(data);
      })
      .catch(() => mostrarToast("No se pudo cargar la lista de modelos.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regLongitud = form.contrasena.length >= 8;
  const regMayus = /[A-Z]/.test(form.contrasena);
  const regMinus = /[a-z]/.test(form.contrasena);
  const regNum = /[0-9]/.test(form.contrasena);
  const regEspecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.contrasena);

  const esContrasenaValida = regLongitud && regMayus && regMinus && regNum && regEspecial;

  // Coincidencia de confirmar contraseña, en tiempo real
  const contrasenasCoinciden = form.confirmarContrasena.length > 0 && form.confirmarContrasena === form.contrasena;
  const contrasenasNoCoinciden = form.confirmarContrasena.length > 0 && form.confirmarContrasena !== form.contrasena;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: false }));
  };

  const handleMotoChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;

    if (name === "placa") {
      // Solo letras y números (sin espacios ni símbolos), en mayúscula,
      // máximo 6 caracteres (formato típico de placa: 3 letras + 3 números)
      valorFormateado = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    } else if (name === "kilometraje_actual") {
      // Solo números enteros positivos -- sin punto decimal, sin signo negativo
      valorFormateado = value.replace(/[^\d]/g, "");
    } else if (name === "id_modelo" && value === "__nuevo__") {
      // Eligió "¿No está tu modelo?" -- cambia a modo texto libre
      setAgregandoModeloNuevo(true);
      setErroresMoto((prev) => ({ ...prev, id_modelo: false }));
      return;
    }

    setMoto((prev) => ({ ...prev, [name]: valorFormateado }));
    setErroresMoto((prev) => ({ ...prev, [name]: false }));
  };

  // Paso 1 -> Paso 2, con una animación de transición
  const irAPaso2 = () => {
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
    setAnimando(true);
    setTimeout(() => {
      setPaso(2);
      setAnimando(false);
    }, 300);
  };

  const volverAPaso1 = () => {
    setAnimando(true);
    setTimeout(() => {
      setPaso(1);
      setAnimando(false);
    }, 300);
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();

    const nuevosErroresMoto = {
      placa: !moto.placa.trim(),
      id_modelo: agregandoModeloNuevo ? !nombreModeloNuevo.trim() : !moto.id_modelo,
      kilometraje_actual: moto.kilometraje_actual === '' || isNaN(Number(moto.kilometraje_actual)) || Number(moto.kilometraje_actual) < 0,
    };

    if (Object.values(nuevosErroresMoto).some(Boolean)) {
      setErroresMoto(nuevosErroresMoto);
      mostrarToast('Completa los datos de tu motocicleta correctamente.', 'warning');
      return;
    }

    setCargando(true);

    try {
      const response = await axios.post('/api/auth/establecer-contrasena-cliente', {
        token: tokenOculto,
        contrasena: form.contrasena,
        placa: moto.placa,
        id_modelo: agregandoModeloNuevo ? undefined : moto.id_modelo,
        nombreModeloNuevo: agregandoModeloNuevo ? nombreModeloNuevo : undefined,
        kilometraje_actual: moto.kilometraje_actual
      });

      mostrarToast(response.data.message || '¡Todo listo!', 'success');

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || 'Error al procesar la solicitud';

      if (status === 401 || status === 400 && msg.includes('enlace')) {
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
        {!tokenInvalido && (
          <>
            <h2 className="register-title">
              {paso === 1 ? "Establecer Contraseña" : "Datos de tu Motocicleta"}
            </h2>
            <p className="register-subtitle">
              {paso === 1
                ? "Crea tu nueva contraseña para activar tu cuenta"
                : "Un último paso: registra tu moto para poder agendar servicios"}
            </p>

            {/* Indicador de pasos */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: "#ff7300" }}></div>
              <div style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: paso === 2 ? "#ff7300" : "#e5e7eb", transition: "background-color 0.3s" }}></div>
            </div>
          </>
        )}

        {tokenInvalido ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', color: '#dc3545', marginBottom: '15px' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <h3 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '10px' }}>Enlace expirado o no válido</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>{mensajeEstado}</p>
          </div>
        ) : (
          <div style={{
            opacity: animando ? 0 : 1,
            transform: animando ? "translateX(-16px)" : "translateX(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease"
          }}>
            {paso === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); irAPaso2(); }}>
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
                  </div>

                  <div className="register-field">
                    <label className="register-label">
                      <i className="fa-solid fa-lock me-2"></i>Confirmar Contraseña
                    </label>

                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        className={`register-input ${errores.confirmarContrasena || contrasenasNoCoinciden ? "register-input-error" : ""}`}
                        type="password"
                        name="confirmarContrasena"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={form.confirmarContrasena}
                        onChange={handleChange}
                        style={{ paddingRight: "36px" }}
                      />
                      {form.confirmarContrasena.length > 0 && (
                        <i
                          className={`fa-solid ${contrasenasCoinciden ? "fa-circle-check" : "fa-circle-xmark"}`}
                          style={{
                            position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                            color: contrasenasCoinciden ? "#28a745" : "#dc3545", fontSize: "16px"
                          }}
                        ></i>
                      )}
                    </div>

                    {(errores.confirmarContrasena || contrasenasNoCoinciden) && (
                      <small className="register-error-msg">
                        <i className="fa-solid fa-circle-exclamation me-1"></i>
                        Las contraseñas deben coincidir
                      </small>
                    )}  
                  </div>
                </div>

                <button type="submit" className="register-btn">
                  Siguiente <i className="fa-solid fa-arrow-right ms-2"></i>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitFinal}>
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">
                      <i className="fa-solid fa-motorcycle me-2"></i>Placa
                    </label>
                    <input
                      className={`register-input ${erroresMoto.placa ? "register-input-error" : ""}`}
                      type="text"
                      name="placa"
                      placeholder="ABC123"
                      value={moto.placa}
                      onChange={handleMotoChange}
                    />
                    {erroresMoto.placa && (
                      <small className="register-error-msg">
                        <i className="fa-solid fa-circle-exclamation me-1"></i>
                        La placa es obligatoria
                      </small>
                    )}
                  </div>

                  <div className="register-field">
                    <label className="register-label">
                      <i className="fa-solid fa-gauge-high me-2"></i>Kilometraje actual
                    </label>
                    <input
                      className={`register-input ${erroresMoto.kilometraje_actual ? "register-input-error" : ""}`}
                      type="text"
                      name="kilometraje_actual"
                      placeholder="Ej: 15000"
                      value={moto.kilometraje_actual}
                      onChange={handleMotoChange}
                    />
                    {erroresMoto.kilometraje_actual && (
                      <small className="register-error-msg">
                        <i className="fa-solid fa-circle-exclamation me-1"></i>
                        Ingresa un kilometraje válido
                      </small>
                    )}
                  </div>
                </div>

                <div className="register-field" style={{ width: "100%" }}>
                  <label className="register-label">
                    <i className="fa-solid fa-motorcycle me-2"></i>Modelo de tu motocicleta
                  </label>

                  {!agregandoModeloNuevo ? (
                    <select
                      className={`register-input ${erroresMoto.id_modelo ? "register-input-error" : ""}`}
                      name="id_modelo"
                      value={moto.id_modelo}
                      onChange={handleMotoChange}
                    >
                      <option value="">Selecciona el modelo</option>
                      {modelos.map(m => (
                        <option key={m.id_modelo} value={m.id_modelo}>{m.nombre}</option>
                      ))}
                      <option value="__nuevo__">¿No está tu modelo? Agregar modelo de mi moto</option>
                    </select>
                  ) : (
                    <div>
                      <input
                        className={`register-input ${erroresMoto.id_modelo ? "register-input-error" : ""}`}
                        type="text"
                        placeholder="Ej: DUKE 200"
                        value={nombreModeloNuevo}
                        onChange={(e) => {
                            setNombreModeloNuevo(e.target.value.toUpperCase());
                            setErroresMoto((prev) => ({ ...prev, id_modelo: false }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => { setAgregandoModeloNuevo(false); setNombreModeloNuevo(''); }}
                        style={{ background: "none", border: "none", color: "#ff7300", fontSize: "12px", marginTop: "6px", cursor: "pointer", padding: 0 }}
                      >
                        <i className="fa-solid fa-arrow-left me-1"></i>Volver a elegir de la lista
                      </button>
                    </div>
                  )}

                  {erroresMoto.id_modelo && (
                    <small className="register-error-msg">
                      <i className="fa-solid fa-circle-exclamation me-1"></i>
                      {agregandoModeloNuevo ? "Escribe el nombre del modelo" : "Selecciona un modelo"}
                    </small>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="register-btn" style={{ backgroundColor: "#e5e7eb", color: "#1a1a2e" }} onClick={volverAPaso1}>
                    <i className="fa-solid fa-arrow-left me-2"></i>Atrás
                  </button>
                  <button type="submit" className="register-btn" disabled={cargando}>
                    {cargando
                      ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Guardando...</>
                      : <><i className="fa-solid fa-check me-2"></i>Finalizar registro</>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>    
    </div>  
  );
}

export default FormPassword;