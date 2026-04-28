import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="TU_CLIENT_ID">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)
