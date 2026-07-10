import { Navigate } from "react-router-dom";
import { desencriptar } from "../../utils/crypto";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const tokenEncriptado = localStorage.getItem("token");
    const rolEncriptado = localStorage.getItem("rol");

    const token = desencriptar(tokenEncriptado || "");
    const rol = desencriptar(rolEncriptado || "");

    if (!token || !rol) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;