import { useEffect, useState } from "react";
import axios from "axios";

function UserForm({ idSeleccionado, setIdSeleccionado, getUsuarios }) {

    const [form, setForm] = useState({
        codigo_usuario: "",
        nombre: "",
        apellido: "",
        correo_usuario: "",
        telefono_usuario: ""
    });

    useEffect(() => {
        if (idSeleccionado) {
            setForm(idSeleccionado);
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // función para enviar la actualización al backend
    const handleSubmit  = () => {
        if (idSeleccionado) {
        axios.put(`http://localhost:4000/api/usuarios/modificar/${idSeleccionado}`, form)

            .then(() => {
                alert(" Categoria usuario actualizada con éxito");
                getUsuarios();
                resetForm();
            })
            .catch(err => console.error(err));
        } else {
            // función para registrar usuarios y enviarlos al backend
            axios.post("http://localhost:4000/api/usuarios/crear", form)

                .then(() => {
                    alert("Registro Exitoso");
                    getUsuarios();
                    resetForm();
                });
        }
    };

  // función limpiar formulario
  const resetForm = () => {
    setIdSeleccionado(null);
    setForm({
      codigo_usuario: "",
      nombre: "",
      apellido: "",
      correo_usuario: "",
      telefono_usuario: ""
    });
  };

  return (
    <div className="card">
        <h2>{idSeleccionado ? "Editar Usuario" : "Registrar Usuario"}</h2>

        <input name="codigo_usuario" value={form.codigo_usuario} onChange={handleChange} placeholder="Código" />
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
        <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" />
        <input name="correo_usuario" value={form.correo_usuario} onChange={handleChange} placeholder="Correo" />
        <input name="telefono_usuario" value={form.telefono_usuario} onChange={handleChange} placeholder="Teléfono" />

        <button onClick={handleSubmit}>
            {idSeleccionado ? "Actualizar" : "Registrar"}
        </button>
    </div>
    
  )
}

export default UserForm;