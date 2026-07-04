import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "../axiosConfig";
import { useAuth } from "./AuthContext";

const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
    const { esAdmin } = useAuth();
    const [ordenesEsperando, setOrdenesEsperando] = useState(0);

    const actualizarNotifs = useCallback(async () => {
        if (esAdmin) return;
        try {
            const res = await axios.get("http://localhost:4000/api/imagenes_danos/mis-ordenes");
            setOrdenesEsperando(res.data.length);
        } catch (err) {
            console.error(err);
        }
    }, [esAdmin]);

    useEffect(() => {
        actualizarNotifs();
        const interval = setInterval(actualizarNotifs, 10000);
        return () => clearInterval(interval);
    }, [actualizarNotifs]);

    // Escuchar cuando el estado de una orden cambia
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