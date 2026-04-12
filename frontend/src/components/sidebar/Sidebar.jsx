import { Link } from "react-router-dom";
import './Sidebar.css';

const Sidebar = () => {
    
    return <div className="menu">
        <div className="name-company">
            <h2>Rocket Service</h2>
        </div>

        <div className="menu-list">
            <Link to="/panel" className="item">
                <i className="fa-solid fa-house"></i>
                Dashboard
            </Link>
            
            <Link to="/panel/users" className="item">
                <i className="fa-solid fa-user"></i>
                Usuarios
            </Link>

            <Link to="/panel/roles" className="item">
                <i className="fa-solid fa-user"></i>
                Roles
            </Link>

            <Link to="/panel/regist-act" className="item">
                <i className="fa-solid fa-calendar"></i>
                Registro actividad
            </Link>

            <Link to="/panel/insumos" className="item">
                <i className="fa-solid fa-box"></i>
                Insumos
            </Link>

             <Link to="/panel/insumos-usados" className="item">
                <i className="fa-solid fa-box"></i>
                Insumos usados serv
            </Link>

            <Link to="/panel/orders" className="item">
                <i className="fa-solid fa-business-time"></i>
                Ordenes
            </Link>

            <Link to="/panel/type-services" className="item">
                <i className="fa-solid fa-box"></i>
                Tipo servicio
            </Link>


            <Link to="/panel/reports" className="item">
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