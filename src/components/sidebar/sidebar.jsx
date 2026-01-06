import React from 'react';

const Sidebar = () => {
    return <div className="menu">
        <div className="name-company">
            <h2>Rocket Service</h2>
        </div>

        <div className="menu-list">
            <a href="#" className="item"></a>
            <i class="fa-solid fa-house"></i>
            Dasdboard
        </div>

        <div className="menu-list">
            <a href="#" className="item"></a>
            <i class="fa-solid fa-users"></i>
            Usuarios
        </div>
        
        <div className="menu-list">
            <a href="#" className="item"></a>
            Insumos
        </div>
    </div>;
};

export default Sidebar;