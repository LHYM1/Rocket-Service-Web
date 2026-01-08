import 'react-router-dom';

const Sidebar = () => {
    return <div className="menu">
        <div className="name-company">
            <h2>Rocket Service</h2>
        </div>

        <div className="menu-list">
            <a href="#" className="item">
                <i class="fa-solid fa-house"></i>
                Dasdboard
            </a>
            
            <a href="#" className="item">
                <i class="fa-solid fa-user"></i>
                Usuarios
            </a>

            <a href="#" className="item">
                Insumos
            </a>
            
            <a href="#" className="item">
                Ayuda
            </a>

            <a href="#" className="item">
                Ajustes
            </a>
        </div>

    </div>;
};

export default Sidebar;