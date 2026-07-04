import Sidebar from "../components/sidebar/Sidebar.jsx";
import Navbar from "../components/navbar/navbar.jsx";
import "./DashboardLayout.css"; /*Estilos globales dashboard, profile y content*/
import { Outlet } from "react-router-dom";


const DashboardLayout = () => { 
  return (

    

    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-main">
          <div className="dashboard-navbar">
            <Navbar />
          </div>

        <div className="dashboard-content">
          <Outlet /> {/* Aquí cambia el contenido central */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;