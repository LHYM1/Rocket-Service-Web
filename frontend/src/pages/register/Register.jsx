import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './register.css';

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
    <div className="containerRegister">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="usuario" placeholder="Usuario" value={form.usuario} onChange={handleChange} />
        <input type="password" name="contrasena" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} />
        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
        <input type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
        <input type="email" name="correo_usuario" placeholder="Correo" value={form.correo_usuario} onChange={handleChange} />
        <input type="tel" name="telefono_usuario" placeholder="Teléfono" value={form.telefono_usuario} onChange={handleChange} />

        <button type="submit">Registrarme</button>
      </form>
    </div>
  );
}

export default Registro;
