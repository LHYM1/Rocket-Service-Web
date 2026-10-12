import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import Register from './pages/register/Register.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Report from './pages/reports/Report.jsx';
import ProtectedRoute from './components/proctRoute/ProctectedRoute.jsx';
import Content from './components/content/Content.jsx';
import Profile from './components/profile/Profile.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import RolesPage from './pages/roles/RolesPage.jsx';
import OrdersPage from './pages/orders/OrdersPage.jsx';
import TypeServPage from './pages/typeService/TypeServPage.jsx';
import ProductsPage from './pages/products/productsPage.jsx';
import ProdtsUseServ from './pages/prdtsUseServ/prodtsUsServPage.jsx';
import RegistActv from './pages/regstActv/regstActvPage.jsx';
import ImagDanos from './pages/imgDanos/PageImg.jsx';
import Motocicleta from './pages/motocicleta/PageMoto.jsx';
import EstadoOrdenPage from './pages/estOrdn/PageEstadoOrd.jsx';
import Categoria from './pages/categoria/PageCategoria.jsx';
import UnidadMedPage from './pages/undMed/PageUnidadMed.jsx';
import PreRevisionPage from './pages/preRevision/PreRevisionPage.jsx';
import FormEstbPassword from './components/formPassword/FormPassword.jsx';


// Componente que redirige según rol
const RedirigirPorRol = () => {
    const rol = localStorage.getItem("rol");
    if (rol === "Administrador") return <Navigate to="/panel/dashboard" replace />;
    if (rol === "Técnico") return <Navigate to="/panel/orders" replace />;
    if (rol === "Cliente") return <Navigate to="/panel/orders" replace />;

    return <Navigate to="/" replace />;
};

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/establecer-contrasena" element={<FormEstbPassword />} />

        <Route
          path="/panel"
          element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico", "Cliente"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirección inteligente según rol */}
          <Route index element={<RedirigirPorRol />} />

          {/* Ruta dashboard solo admin */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <Dashboard />
            </ProtectedRoute>
          }/>

          <Route path="users" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <UsersPage />
            </ProtectedRoute>
          }/>

          <Route path="roles" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <RolesPage />
            </ProtectedRoute>
          }/>

          <Route path="est-ord" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <EstadoOrdenPage />
            </ProtectedRoute>
          }/>

          <Route path="insumos" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <ProductsPage />
            </ProtectedRoute>
          }/>

          <Route path="categoria" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <Categoria />
            </ProtectedRoute>
          }/>

          <Route path="unidad" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <UnidadMedPage />
            </ProtectedRoute>
          }/>

          <Route path="moto" element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <Motocicleta />
            </ProtectedRoute>
          }/>

          {/* Admin, Técnico y cliente */}
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico", "Cliente"]}>
              <OrdersPage />
            </ProtectedRoute>
          }/>

          <Route path="regist-act" element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico"]}>
              <RegistActv />
            </ProtectedRoute>
          }/>

          <Route path="insumos-usados" element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico"]}>
              <ProdtsUseServ />
            </ProtectedRoute>
          }/>

          <Route path="imagenes-danos" element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico"]}>
              <ImagDanos />
            </ProtectedRoute>
          }/>

          <Route path="type-services" element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico"]}>
              <TypeServPage />
            </ProtectedRoute>
          }/>

          <Route path="pre-revision" element={
            <ProtectedRoute allowedRoles={["Administrador", "Técnico"]}>
              <PreRevisionPage />
            </ProtectedRoute>
        }/>

          <Route path="content" element={<Content />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={<Report />} />

        </Route>
      </Routes>
  );
}

export default App;