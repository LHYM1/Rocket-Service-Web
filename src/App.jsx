import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="dashboard" element={<DashboardLayout />}>
           <Route index element={<Dashboard />} />       
        </Route>

      </Routes>
    </Router>  
  
  );
}

export default App;