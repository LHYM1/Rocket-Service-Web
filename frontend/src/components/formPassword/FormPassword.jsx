import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';
import '../../components/formPassword/formPassword.css';

const KILOMETRAJE_MAXIMO = 500000; // Límite razonable y generoso (una moto bien
// cuidada suele durar entre 100.000 y 150.000 km; 500.000 cubre hasta casos
// excepcionales, sin permitir números sin sentido como "999999999")

function FormPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const [tokenOculto, setTokenOculto] = useState('');
  const [paso, setPaso] = useState(1);
  const [animando, setAnimando] = useState(false);

  const [form, setForm] = useState({
    contrasena: '',
    confirmarContrasena: '',
  });

  // Visibilidad de cada campo de contraseña (ojito)
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

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

  const contrasenasCoinciden = form.confirmarContrasena.length > 0 && form.confirmarContrasena === form.contrasena;
  const contrasenasNoCoinciden = form.confirmarContrasena.length > 0 && form.confirmarContrasena !== form.contrasena;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: false }));
  };

  // Formatea la placa MIENTRAS se escribe: solo letras/números, mayúscula,
  // y un espacio automático después de las primeras 3 posiciones (ej: "LKJ 213")
  const formatearPlaca = (valorCrudo) => {
    const limpio = valorCrudo.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    if (limpio.length <= 3) return limpio;
    return `${limpio.slice(0, 3)} ${limpio.slice(3)}`;
  };

  const handleMotoChange = (e) => {
    const { name, value } = e.target;

    if (name === "placa") {
      setMoto((prev) => ({ ...prev, placa: formatearPlaca(value) }));
      setErroresMoto((prev) => ({ ...prev, placa: false }));
      return;
    }

    if (name === "kilometraje_actual") {
      let soloNumeros = value.replace(/[^\d]/g, "").slice(0, 6);
      // No deja escribir un número que ya se pase del máximo permitido
      if (soloNumeros !== "" && Number(soloNumeros) > KILOMETRAJE_MAXIMO) {
        soloNumeros = String(KILOMETRAJE_MAXIMO);
      }
      setMoto((prev) => ({ ...prev, kilometraje_actual: soloNumeros }));
      setErroresMoto((prev) => ({ ...prev, kilometraje_actual: false }));
      return;
    }

    if (name === "id_modelo" && value === "__nuevo__") {
      setAgregandoModeloNuevo(true);
      setErroresMoto((prev) => ({ ...prev, id_modelo: false }));
      return;
    }

    setMoto((prev) => ({ ...prev, [name]: value }));
    setErroresMoto((prev) => ({ ...prev, [name]: false }));
  };

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

  const [registroExitoso, setRegistroExitoso] = useState(false);

  const handleSubmitFinal = async (e) => {
    e.preventDefault();

    const kmNum = Number(moto.kilometraje_actual);

    const nuevosErroresMoto = {
      placa: moto.placa.replace(/\s/g, "").length !== 6,
      id_modelo: agregandoModeloNuevo ? !nombreModeloNuevo.trim() : !moto.id_modelo,
      kilometraje_actual: moto.kilometraje_actual === '' || isNaN(kmNum) || kmNum < 0 || kmNum > KILOMETRAJE_MAXIMO,
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

      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      localStorage.removeItem("userId");
      setRegistroExitoso(true);

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || 'Error al procesar la solicitud';

      if (status === 401 || (status === 400 && msg.includes('enlace'))) {
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

  if (registroExitoso) {
    return (
      <div className="register-container">
        <div className="register-form-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", margin: "0 auto 20px"
          }}>
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 className="register-title" style={{ color: '#1a1a2e' }}>¡Todo listo!</h2>
          <p className="register-subtitle" style={{ color: '#4b5563', margin: '12px 0 28px' }}>
            Tu cuenta y tu motocicleta ya están registradas. Inicia sesión para entrar a tu panel.
          </p>
          <button
            className="register-btn"
            onClick={() => navigate("/")}
            style={{ maxWidth: 260, margin: "0 auto" }}
          >
            <i className="fa-solid fa-right-to-bracket me-2"></i>Ir a Iniciar Sesión
          </button>
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

                    <div style={{ position: "relative", width: "100%" }}>
                      <input 
                        className={`register-input ${errores.contrasena ? "register-input-error" : ""}`}
                        type={verContrasena ? "text" : "password"}
                        name="contrasena"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={form.contrasena}
                        onChange={handleChange}
                        style={{ paddingRight: "40px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setVerContrasena(v => !v)}
                        tabIndex={-1}
                        style={{
                          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: "#6b7280"
                        }}
                      >
                        <i className={`fa-solid ${verContrasena ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>

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
                        type={verConfirmar ? "text" : "password"}
                        name="confirmarContrasena"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={form.confirmarContrasena}
                        onChange={handleChange}
                        style={{ paddingRight: "64px" }}
                      />
                      {form.confirmarContrasena.length > 0 && (
                        <i
                          className={`fa-solid ${contrasenasCoinciden ? "fa-circle-check" : "fa-circle-xmark"}`}
                          style={{
                            position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%)",
                            color: contrasenasCoinciden ? "#28a745" : "#dc3545", fontSize: "16px"
                          }}
                        ></i>
                      )}
                      <button
                        type="button"
                        onClick={() => setVerConfirmar(v => !v)}
                        tabIndex={-1}
                        style={{
                          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: "#6b7280"
                        }}
                      >
                        <i className={`fa-solid ${verConfirmar ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
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
                      <i className="fa-solid fa-id-card me-2"></i>Placa
                    </label>
                    <input
                      className={`register-input ${erroresMoto.placa ? "register-input-error" : ""}`}
                      type="text"
                      name="placa"
                      placeholder="ABC 123"
                      value={moto.placa}
                      onChange={handleMotoChange}
                      style={{ textAlign: "center", letterSpacing: "2px", fontWeight: 700, fontSize: "16px" }}
                    />
                    {erroresMoto.placa && (
                      <small className="register-error-msg">
                        <i className="fa-solid fa-circle-exclamation me-1"></i>
                        La placa debe tener 6 caracteres (letras y números)
                      </small>
                    )}
                  </div>

                  <div className="register-field">
                    <label className="register-label">
                      <i className="fa-solid fa-gauge-high me-2"></i>Kilometraje actual
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        className={`register-input ${erroresMoto.kilometraje_actual ? "register-input-error" : ""}`}
                        type="text"
                        inputMode="numeric"
                        name="kilometraje_actual"
                        placeholder="Ej: 15000"
                        value={moto.kilometraje_actual}
                        onChange={handleMotoChange}
                        style={{ paddingRight: "36px" }}
                      />
                      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>km</span>
                    </div>
                    {erroresMoto.kilometraje_actual ? (
                      <small className="register-error-msg">
                        <i className="fa-solid fa-circle-exclamation me-1"></i>
                        Debe ser un número entre 0 y {KILOMETRAJE_MAXIMO.toLocaleString('es-CO')}
                      </small>
                    ) : (
                      <span className="rs-hint" style={{ fontSize: "11px" }}>Máximo {KILOMETRAJE_MAXIMO.toLocaleString('es-CO')} km</span>
                    )}
                  </div>
                </div>

                <div className="register-field" style={{ width: "100%" }}>
                  <label className="register-label">
                    <i className="fa-solid fa-motorcycle me-2"></i>Modelo de tu motocicleta
                  </label>

                  {!agregandoModeloNuevo ? (
                    <>
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
                      </select>
                      <button
                        type="button"
                        onClick={() => setAgregandoModeloNuevo(true)}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          width: "100%", marginTop: "10px", padding: "10px 14px",
                          background: "#fff8ee", border: "1.5px dashed #ff8c0060",
                          borderRadius: "10px", cursor: "pointer", textAlign: "left"
                        }}
                      >
                        <div style={{
                          width: "26px", height: "26px", borderRadius: "50%",
                          backgroundColor: "#ff8c0020", display: "flex",
                          alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          <i className="fa-solid fa-plus" style={{ color: "#ff7300", fontSize: "11px" }}></i>
                        </div>
                        <span style={{ fontSize: "13px", color: "#9a5b00", fontWeight: 600 }}>
                          ¿No está tu modelo? Agrégalo aquí
                        </span>
                      </button>
                    </>
                  ) : (
                    <div style={{
                      background: "#fff8ee", border: "1.5px solid #ff8c0040",
                      borderRadius: "10px", padding: "14px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <i className="fa-solid fa-motorcycle" style={{ color: "#ff7300" }}></i>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>Nuevo modelo</span>
                      </div>
                      <input
                        className={`register-input ${erroresMoto.id_modelo ? "register-input-error" : ""}`}
                        type="text"
                        placeholder="Ej: DUKE 200"
                        value={nombreModeloNuevo}
                        onChange={(e) => {
                            setNombreModeloNuevo(e.target.value.toUpperCase());
                            setErroresMoto((prev) => ({ ...prev, id_modelo: false }));
                        }}
                        style={{ backgroundColor: "white" }}
                      />
                      <button
                        type="button"
                        onClick={() => { setAgregandoModeloNuevo(false); setNombreModeloNuevo(''); }}
                        style={{ background: "none", border: "none", color: "#ff7300", fontSize: "12px", marginTop: "8px", cursor: "pointer", padding: 0, fontWeight: 600 }}
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