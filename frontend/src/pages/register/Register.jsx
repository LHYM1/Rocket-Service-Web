import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import './register.css';

function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    usuario: "",
    contrasena: "",
    nombre: "",
    apellido: "",
    correo_usuario: "",
    telefono_usuario: "",
    id_tipo_usuario: 2 // por defecto "usuario normal"
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!form.usuario || !form.contrasena || !form.nombre || !form.apellido) {
      alert("Todos los campos obligatorios deben estar completos");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registro exitoso");
        navigate("/login"); // redirige al login
      } else {
        alert(data.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error en el servidor");
    }
  };

  return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow p-4" style={{ maxWidth: "800px", width: "100%" }}>
            <h2 className="text-center mb-4">Registro de Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                    <input type="text" name="usuario" placeholder="Usuario"
                        className="form-control" value={form.usuario} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                    <input type="password" name="contrasena" placeholder="Contraseña"
                        className="form-control" value={form.contrasena} onChange={handleChange} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                    <input type="text" name="nombre" placeholder="Nombre"
                        className="form-control" value={form.nombre} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                    <input type="text" name="apellido" placeholder="Apellido"
                        className="form-control" value={form.apellido} onChange={handleChange} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                    <input type="email" name="correo_usuario" placeholder="Correo"
                        className="form-control" value={form.correo_usuario} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                    <input type="tel" name="telefono_usuario" placeholder="Teléfono"
                        className="form-control" value={form.telefono_usuario} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="btn w-50" style={{ backgroundColor: "#ff6600", color: "white" }}>
                    Registrarme
                </button>
            </form>
        </div>
    </div>
  );
}

export default Registro;
