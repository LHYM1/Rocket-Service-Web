import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from './context/ToastContext.jsx';
import { NotifProvider } from './context/NotifContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="TU_CLIENT_ID">
      {/* El Router ahora envuelve todo desde aquí, en vez de estar adentro de
          App.js -- así ToastProvider (y cualquier otro Provider) SÍ tiene
          acceso al contexto de React Router (useNavigate, etc.) */}
      <Router>
        <AuthProvider>
          <ToastProvider>
            <NotifProvider>
              <App />
            </NotifProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  </StrictMode>
);