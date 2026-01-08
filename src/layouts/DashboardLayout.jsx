import Sidebar from "../components/sidebar/Sidebar.jsx";
import Navbar from "../components/navbar/navbar.jsx";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (

    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Navbar />
        <Outlet /> {/* Aquí cambia el contenido central */}
      </div>
    </div>
  );
};

export default DashboardLayout;