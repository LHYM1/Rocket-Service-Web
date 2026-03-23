import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './login.css';
import GoogleButton from "../../components/btnLogin/googleButton";
import Register from "../register/Register"

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

        navigate("/panel");

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