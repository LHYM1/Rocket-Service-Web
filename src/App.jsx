import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import Login from "./pages/login/login.jsx";

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>  
    </>
  )
}

export default App