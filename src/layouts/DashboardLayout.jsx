import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Navbar />
        <Outlet /> {/* Aquí se renderizan las rutas hijas */}
      </div>
    </div>
  );
};

export default DashboardLayout;