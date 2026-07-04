import { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const getRol = () => localStorage.getItem("rol");
    const getToken = () => localStorage.getItem("token");
    const getUserId = () => localStorage.getItem("userId");

    return (
        <AuthContext.Provider value={{
            get rol() { return getRol(); },
            get token() { return getToken(); },
            get userId() { return getUserId(); },
            get esAdmin() { return getRol() === "Administrador"; },
            get esTecnico() { return getRol() === "Técnico"; }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);