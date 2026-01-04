import { useState } from "react";
import '../App.css';

function Iniciarsesion() {
    const [form, setForm] = useState({
        usuario: "",
        contraseña: ""
    });


    const handleChange = (e) => {
        setForm ({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // simulación envío de datos
        console.log("Datos del formulario:", form);

        if (form.usuario === "" || form.contrasena === "") {
        alert("Todos los campos son obligatorios");
        return;
        }

        // Aquí va el código de autenticación
        alert("Inicio de sesión exitoso");

    };

    return (
        <div>
            <h2>Inicio de Sesión</h2>

            <form onSubmit={handleSubmit}>
                <div>
                <label>Usuario</label>
                <input
                    type="text"
                    name="usuario"
                    value={form.usuario}
                    onChange={handleChange}
                />
                </div>

                <div>
                <label>Contraseña</label>
                <input
                    type="password"
                    name="contrasena"
                    value={form.contraseña}
                    onChange={handleChange}
                />
                </div>

            
                <div className="container">
                    <button className='neon-3d-button'>Inicio sesión</button>
                </div>

            </form>
        </div>
    );
}

export default Iniciarsesion;