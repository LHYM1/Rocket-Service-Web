import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Se guarda como ESTADO real de React (no solo getters), para que cuando
    // cambie, los componentes que lo usan SÍ se vuelvan a renderizar de verdad.
    const [rol, setRol] = useState(() => localStorage.getItem("rol"));
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

    // Vuelve a leer el localStorage y actualiza el estado -- se llama cada vez
    // que login/logout avisan con el evento "authChanged"
    const recargarDesdeStorage = useCallback(() => {
        setRol(localStorage.getItem("rol"));
        setToken(localStorage.getItem("token"));
        setUserId(localStorage.getItem("userId"));
    }, []);

    useEffect(() => {
        // "authChanged": lo dispara login.jsx y el logout del Sidebar, en la MISMA pestaña
        window.addEventListener("authChanged", recargarDesdeStorage);
        // "storage": evento nativo del navegador, se dispara cuando OTRA pestaña
        // cambia el localStorage (ej. si cierras sesión en una pestaña y tienes
        // otra abierta con el mismo sitio)
        window.addEventListener("storage", recargarDesdeStorage);
        return () => {
            window.removeEventListener("authChanged", recargarDesdeStorage);
            window.removeEventListener("storage", recargarDesdeStorage);
        };
    }, [recargarDesdeStorage]);

    const esAdmin = rol === "Administrador";
    const esTecnico = rol === "Técnico";
    const esCliente = rol === "Cliente";

    return (
        <AuthContext.Provider value={{ rol, token, userId, esAdmin, esTecnico, esCliente }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);