import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './login.css';
import GoogleButton from "../../components/btnLogin/googleButton";

function Iniciarsesion() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        usuario: "",
        contrasena: ""
    });


    const handleChange = (e) => {
        setForm ({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // simulación envío de datos
        console.log("Datos del formulario:", form);

        if (form.usuario === "" || form.contrasena === "") {
            alert("Todos los campos son obligatorios");
            return;
        }

        // petición al backend
        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo_usuario: form.usuario, 
                    contrasena: form.contrasena
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Error al iniciar sesión");
                return;
            }

            // guardar token
            localStorage.setItem("token", data.token);

            alert("Inicio de sesión exitoso.");

            navigate("/panel");

        } catch (error) {
            console.error(error);
            alert("Error en el servidor");
        }
    };

    return (
        <div className="containerLogin">
            <h2 className="h2p">Inicio de Sesión</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className="userLabel">Usuario</label>
                    <input className="inputUser"
                        type="text"
                        name="usuario"
                        value={form.usuario}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="userLabel">Contraseña</label>
                    <input className="inputUser"
                        type="password"
                        name="contrasena"
                        value={form.contrasena}
                        onChange={handleChange}
                    />
                </div>

            
                <div className="container">
                    <button className='neon-3d-button'>Iniciar sesión</button>
                </div>

                <div className="formPassword">
                    <a href="forgotPassword" className="passwordLink">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
                
                <div className="formRegister">
                    <Link to="/register" className="registerLink">
                        <span className="highlight">¿Primera vez en Rocket?</span> 
                            <span className="highlightRegst"> Registrarme</span>         
                    </Link>
                </div>

                <div className="separator">
                    <span>o también puedes iniciar sesión con</span>
                </div>

                <div className="googleBtn">
                    <GoogleButton />
                </div>
                
            </form>
        </div>
    );
}

export default Iniciarsesion;