import { createContext, useContext } from "react";
import { desencriptar } from "../utils/crypto";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const getRol    = () => desencriptar(localStorage.getItem("rol") || "");
    const getToken  = () => desencriptar(localStorage.getItem("token") || "");
    const getUserId = () => desencriptar(localStorage.getItem("userId") || "");

    return (
        <AuthContext.Provider value={{
            get rol()      { return getRol(); },
            get token()    { return getToken(); },
            get userId()   { return getUserId(); },
            get esAdmin()  { return getRol() === "Administrador"; },
            get esTecnico(){ return getRol() === "Técnico"; }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);