import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <section className="header">
            <h1 className="empresa">Rocket Service</h1>
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