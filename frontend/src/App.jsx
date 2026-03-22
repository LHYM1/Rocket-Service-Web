import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Report from './pages/reports/Report';


import Content from './components/content/Content';
import Profile from './components/profile/Profile';
import UsersPage from './pages/users/UsersPage';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />  

        <Route path="/panel" element={<DashboardLayout />}>
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