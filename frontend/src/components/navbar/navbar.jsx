import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { esTecnico, userId } = useAuth();
    const [disponibilidad, setDisponibilidad] = useState("Disponible");

    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    let nombreUsuario = "";
    if (token) {
        try {
            // atob() por sí solo no maneja bien UTF-8 (rompe tildes/ñ). Este decode
            // intermedio reconstruye correctamente los caracteres multibyte.
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);
            nombreUsuario = `${payload.nombre || ""} ${payload.apellido || ""}`.trim();
        } catch (e) {}
    }

    const getSaludo = () => {
        const hora = new Date().getHours();
        if (hora >= 6 && hora < 12) return "Buenos días";
        if (hora >= 12 && hora < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const coloresDisponibilidad = {
        "Disponible": "#28a745",
        "Realizando servicio": "#ff8c00"
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
        const handleDisponibilidad = (e) => setDisponibilidad(e.detail.estado);
        window.addEventListener('disponibilidadCambiada', handleDisponibilidad);
        return () => window.removeEventListener('disponibilidadCambiada', handleDisponibilidad);
    }, []);

    return (
        <section className="header">
            <nav className="navbar">
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
                {esTecnico && (
                    <span
                        className="btn btn-sm fw-semibold me-2"
                        style={{
                            backgroundColor: coloresDisponibilidad[disponibilidad] || "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "20px",
                            padding: "6px 14px",
                            cursor: "default"
                        }}
                        title="Este estado cambia automáticamente según tu actividad"
                    >
                        <i className="fa-solid fa-circle me-1" style={{ fontSize: "0.6rem" }}></i>
                        {disponibilidad}
                    </span>
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