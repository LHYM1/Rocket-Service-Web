import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';


import Content from './components/content/Content';
import Profile from './components/profile/Profile';
import Card from './components/card/Card';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
           <Route index element={<Dashboard />} />  
           <Route path="content" element={<Content />} />
           <Route path="profile" element={<Profile />} />  
           <Route path="card" element={<Card />} />  
        </Route>

      </Routes>
    </Router>  
  
  );
}

export default App;