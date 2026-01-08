
import './Sidebar.css';

const Sidebar = () => {
    return <div className="menu">
        <div className="name-company">
            <h2>Rocket Service</h2>
        </div>

        <div className="menu-list">
            <Link to="#" className="item">
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
            
            <Link to="#" className="item">
                <i className="fa-solid fa-circle-question"></i>
                Ayuda
            </Link>

            <Link to="#" className="item">
                <i className="fa-solid fa-gear"></i>
                Ajustes
            </Link>
        </div>

    </div>;
};

export default Sidebar;