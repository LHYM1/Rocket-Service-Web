import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token || !rol) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;