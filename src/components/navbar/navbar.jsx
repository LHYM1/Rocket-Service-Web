import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <section className="header">
            <h1>
                <span className="empresa-name1">Rocket</span>
                <span className="empesa-name2">Service</span>
            </h1>
            <nav className="navbar">
                <ul className="navLinks">
                    <li>
                        <Link to = "/" >Home</Link>
                    </li>
                </ul>
            </nav>

            <div className="icons">
                <button className="search-button">
                    <i className="fas fa-search"></i>
                </button>

                <Link to = "/Notifications" className="notification-icon">
                    <i className="fa-regular fa-bell"></i>
                    <span className="counter">0</span>
                </Link>
            </div>
        </section>
    )
}

export default Navbar;