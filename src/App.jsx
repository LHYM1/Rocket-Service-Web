import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="dashboard" element={<DashboardLayout />}>
           <Route path="dashboard" element={<Dashboard />} />  
           <Route path="profile" element={<Profile />} />       
        </Route>

      </Routes>
    </Router>  
  
  );
}

export default App;