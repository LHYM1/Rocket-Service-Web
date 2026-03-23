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
        </Route>
           
      </Routes>
    </Router>  
  
  );
}

export default App;