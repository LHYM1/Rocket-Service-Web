import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
    const { esAdmin } = useAuth();
    const [ordenesEsperando] = useState(0);

    const actualizarNotifs = useCallback(async () => {
        if (esAdmin) return;
        // TODO: implementar cuando la ruta mis-ordenes esté lista
    }, [esAdmin]);

    useEffect(() => {
        actualizarNotifs();
        const interval = setInterval(actualizarNotifs, 10000);
        return () => clearInterval(interval);
    }, [actualizarNotifs]);

    useEffect(() => {
        const handler = () => actualizarNotifs();
        window.addEventListener('ordenActualizada', handler);
        window.addEventListener('disponibilidadCambiada', handler);
        return () => {
            window.removeEventListener('ordenActualizada', handler);
            window.removeEventListener('disponibilidadCambiada', handler);
        };
    }, [actualizarNotifs]);

    return (
        <NotifContext.Provider value={{ ordenesEsperando, actualizarNotifs }}>
            {children}
        </NotifContext.Provider>
    );
};

export const useNotif = () => useContext(NotifContext);