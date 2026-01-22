import { Link } from "react-router-dom";
import './Sidebar.css';

const Sidebar = () => {
    return <div className="menu">
        <div className="name-company">
            <h2>Rocket Service</h2>
        </div>

        <div className="menu-list">
            <Link to="/dashboard" className="item">
                <i className="fa-solid fa-house"></i>
                Dasdboard
            </Link>
            
            <Link to="#" className="item">
                <i className="fa-solid fa-user"></i>
                Usuarios
            </Link>

            <Link to="#" className="item">
                <i className="fa-solid fa-box"></i>
                Insumos
            </Link>

            <Link to="/dashboard/reports" className="item">
                <i className="fa-solid fa-chart-column"></i>
                Reportes
            </Link>
            
            <Link to="#" className="item">
                <i className="fa-solid fa-circle-question"></i>
                Ayuda
            </Link>

            <Link to="#" className="item">
                <i className="fa-solid fa-gear"></i>
                Ajustes
            </Link>

            <Link to="/" className="item">
                <i className="fa-solid fa-right-from-bracket"></i>
                Cerrar sesión
            </Link>
        </div>

    </div>;
};

export default Sidebar;