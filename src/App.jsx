import { BrowserRouter as Router, Routes, Route } 
from 'react-router-dom';
import login from "./login";
import react from 'react';

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<login />} />
      </Routes>
    </Router>  
    </>
  )
}

export default App