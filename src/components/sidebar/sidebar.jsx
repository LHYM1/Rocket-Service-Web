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
                <i class="fa-solid fa-box"></i>
                Insumos
            </a>
            
            <a href="#" className="item">
                <i class="fa-solid fa-circle-question"></i>
                Ayuda
            </a>

            <a href="#" className="item">
                <i class="fa-solid fa-gear"></i>
                Ajustes
            </a>
        </div>

    </div>;
};

export default Sidebar;