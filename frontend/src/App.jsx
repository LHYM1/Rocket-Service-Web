import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import Register from './pages/register/Register.jsx';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Report from './pages/reports/Report';
import ProtectedRoute from './components/proctRoute/ProctectedRoute.jsx';


import Content from './components/content/Content';
import Profile from './components/profile/Profile';
import UsersPage from './pages/users/UsersPage';
import RolesPage from './pages/roles/RolesPage';
import OrdersPage from './pages/orders/OrdersPage';
import TypeServPage from './pages/typeService/TypeServPage';
import ProductsPage from './pages/products/productsPage';
import ProdtsUseServ from './pages/prdtsUseServ/prodtsUsServPage.jsx';
import RegistActv from './pages/regstActv/regstActvPage.jsx';
import ImagDanos from './pages/imgDanos/PageImg.jsx';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} />


        <Route 
          path="/panel" 
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} /> 
          <Route path="content" element={<Content />} />
          <Route path="profile" element={<Profile />} /> 
          <Route path="reports" element={<Report />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="regist-act" element={<RegistActv />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="type-services" element={<TypeServPage />} />
          <Route path="insumos" element={<ProductsPage />}/>
          <Route path="insumos-usados" element={<ProdtsUseServ />} />
          <Route path="imagenes-danos" element={<ImagDanos />} />
        
        </Route>

        <Route 
          path="/panel" 
          element={
            <ProtectedRoute allowedRoles={["Téccnico"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          <Route path="imagenes-danos" element={<ImagDanos />} />
        </Route>
           
      </Routes>
    </Router>  
  
  );
}

export default App;