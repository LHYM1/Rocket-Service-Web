// Protección de rutas
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const user = jwtDecode(token);

  // Validación de rol
  if (!allowedRoles.includes(user.role)) {
    alert(
        "Inicio de sesión exitoso. Pero tu panel y rutas están en construcción 😢"
    );
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;