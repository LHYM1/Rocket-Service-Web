import Sidebar from "../components/sidebar/Sidebar.jsx";
import Navbar from "../components/navbar/navbar.jsx";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (

    <div className="dashboard">
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Navbar />
      </div>
      
      <div className="dashboard-content">
        <Outlet /> {/* Aquí cambia el contenido central */}
      </div>
    </div>
  );
};

export default DashboardLayout;