import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
      <AuthProvider>
        <ToastProvider>
          <NotifProvider>
            <App />
          </NotifProvider>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);