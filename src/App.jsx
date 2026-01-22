import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Report from './pages/reports/Report';


import Content from './components/content/Content';
import Profile from './components/profile/Profile';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="content" element={<Content />} />
          <Route path="profile" element={<Profile />} /> 
          <Route path="/reports" element={<Report />} />   
        </Route>
           
      </Routes>
    </Router>  
  
  );
}

export default App;