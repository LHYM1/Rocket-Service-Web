import React from 'react';
import { link } from 'react-router-dom';
import './Dashboard';
import './navbar.css';

const Navbar = () => {
    return (
        <section className="header">
            <h1 className="empresa">Rocket Service</h1>
            <nav className="navbar">
                <ul className="navLinks">
                    <li>
                        <link to = "/" >Home</link>
                    </li>
                </ul>
            </nav>

            <div className="icons">
                <button className="search-button">
                    <i className="fas fa-search"></i>
                </button>

                <link to = "/Notifications" className="notification-icon">
                    <i className="fa-regular fa-bell"></i>
                    <span className="counter">0</span>
                </link>
            </div>
        </section>
    )
}

export default Navbar;