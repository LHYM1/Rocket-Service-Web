import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';
import { desencriptar } from '../../utils/crypto';

const Navbar = () => {
    const { esTecnico, userId } = useAuth();
    const [disponibilidad, setDisponibilidad] = useState("Disponible");
    const [showDropdown, setShowDropdown] = useState(false);

    // Obtener nombre del usuario del token
    const tokenEncriptado = localStorage.getItem("token");
    const token = desencriptar(tokenEncriptado || "");
    const rolEncriptado = localStorage.getItem("rol");
    const rol = desencriptar(rolEncriptado || "");

    let nombreUsuario = "";
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            nombreUsuario = `${payload.nombre || ""} ${payload.apellido || ""}`.trim();
        } catch (e) {}
    }
    
     // Saludo según hora
    const getSaludo = () => {
        const hora = new Date().getHours();
        if (hora >= 6 && hora < 12) return "Buenos días";
        if (hora >= 12 && hora < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const coloresDisponibilidad = {
        "Disponible": "#28a745",
        "Realizando servicio": "#ff8c00",
        "Fuera de jornada": "#6c757d"
    };

    const cambiarDisponibilidad = async (nuevoEstado) => {
    try {
        await axios.put(`http://localhost:4000/api/registro_actividad/actualizar-disponibilidad/${userId}`, {
            estado_disponibilidad: nuevoEstado
        });

        if (nuevoEstado === "Fuera de jornada") {
            await axios.put(`http://localhost:4000/api/ordenes_de_servicio/actualizar-estado-tecnico/${userId}`, {
                id_estado_de_servicio: 15
            });
            // Disparar evento para que OrdenesPage refresque las cards
            window.dispatchEvent(new CustomEvent('ordenActualizada'));
        }

        setDisponibilidad(nuevoEstado);
        setShowDropdown(false);
    } catch (err) {
        console.error("Error al cambiar disponibilidad:", err);
        alert("Error al cambiar disponibilidad");
    }
};

    useEffect(() => {
        if (esTecnico && userId) {
            axios.get(`http://localhost:4000/api/registro_actividad/disponibilidad/${userId}`)
                .then(res => {
                    if (res.data.estado_disponibilidad) {
                        setDisponibilidad(res.data.estado_disponibilidad);
                    }
                })
                .catch(err => console.error("Error al cargar disponibilidad:", err));
        }
    }, [esTecnico, userId]);

    useEffect(() => {
    const handleDisponibilidad = (e) => {
        setDisponibilidad(e.detail.estado);
    };
    window.addEventListener('disponibilidadCambiada', handleDisponibilidad);
    return () => window.removeEventListener('disponibilidadCambiada', handleDisponibilidad);
    }, []);

    return (
        <section className="header">
            <nav className="navbar">

                {/* Bienvenida con icono perfil */}
                <div className="navbar-welcome">
                    <div className="navbar-avatar">
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="navbar-welcome-text">
                        <span className="welcome-saludo">{getSaludo()},</span>
                        <span className="welcome-info">
                            <span className="welcome-rol">{rol}</span>
                            <span className="welcome-name">{nombreUsuario}</span>
                        </span>
                    </div>
                </div>
            
            </nav>

            <div className="icons">
                {/* Botón disponibilidad solo para técnico */}
                {esTecnico && (
                    <div style={{ position: "relative" }}>
                        <button
                            className="btn btn-sm fw-semibold me-2"
                            style={{
                                backgroundColor: coloresDisponibilidad[disponibilidad],
                                color: "white",
                                border: "none",
                                borderRadius: "20px",
                                padding: "6px 14px"
                            }}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <i className="fa-solid fa-circle me-1" style={{ fontSize: "0.6rem" }}></i>
                            {disponibilidad}
                            <i className="fa-solid fa-chevron-down ms-1" style={{ fontSize: "0.7rem" }}></i>
                        </button>

                        {showDropdown && (
                            <div style={{
                                position: "absolute",
                                top: "110%",
                                right: 0,
                                backgroundColor: "white",
                                borderRadius: "10px",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                                zIndex: 1000,
                                minWidth: "200px",
                                overflow: "hidden"
                            }}>
                                {["Fuera de jornada"].map(estado => (
                                    <button key={estado}
                                        onClick={() => cambiarDisponibilidad(estado)}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            padding: "10px 16px",
                                            border: "none",
                                            backgroundColor: "white",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            color: coloresDisponibilidad[estado],
                                            fontWeight: "normal"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                                    >
                                        <i className="fa-solid fa-circle me-2" style={{ fontSize: "0.6rem" }}></i>
                                        {estado}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <Link to="/Notifications" className="notification-icon">
                    <i className="fa-regular fa-bell"></i>
                    <span className="counter">0</span>
                </Link>
            </div>
        </section>
    );
};

export default Navbar;  