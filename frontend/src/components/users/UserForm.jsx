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
            // Si hay alguién seleccionado, llenar el formulario con sus datos
            setForm({
                codigo_usuario: idSeleccionado.codigo_usuario || "",
                nombre: idSeleccionado.nombre || "",
                apellido: idSeleccionado.apellido || "",
                correo_usuario: idSeleccionado.correo_usuario || "",
                telefono_usuario: idSeleccionado.telefono_usuario || ""
            });
        } else {
            resetFormState();   
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
        if (idSeleccionado && idSeleccionado.id_usuario) {
            const idReal = idSeleccionado.id_usuario;

            const { id_usuario, ...datosParaEnviar } = form
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
            })
            .catch(err => console.error("Error al crear usuario:", err));
        }
    };

    // función limpiar formulario
    const resetForm = () => {
        setIdSeleccionado(null);
        resetFormState();
    };

    // Esta función solo limpia los inputs locales
    const resetFormState = () => {
        setForm({
            codigo_usuario: "",
            nombre: "",
            apellido: "",
            correo_usuario: "",
            telefono_usuario: ""
        });
    }

    return (
        <div className="card p-4 mb-4" style={{ backgroundColor: '#f8f9fa' }}>

            <h2 className="mb-4">
                {/* Título dinámico */}
                {idSeleccionado ? "Editar Datos del Usuario" : "Registrar Nuevo Usuario"}
            </h2>

            <input name="codigo_usuario" value={form.codigo_usuario} onChange={handleChange} placeholder="Código" />
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
            <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" />
            <input name="correo_usuario" value={form.correo_usuario} onChange={handleChange} placeholder="Correo" />
            <input name="telefono_usuario" value={form.telefono_usuario} onChange={handleChange} placeholder="Teléfono" />

            <button className={`btn ${idSeleccionado ? 'btn-warning' : 'btn-success'}`}onClick={handleSubmit}>
                {idSeleccionado ? "Actualizar Datos" : "Confirmar registro"}
            </button>

            {idSeleccionado && (
                <button className="btn btn-secondary" onClick={resetForm}>
                    Cancelar Edición
                </button>
            )}
        </div>
        
    )
}
export default UserForm;