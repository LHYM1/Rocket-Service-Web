import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "../axiosConfig";
import { useAuth } from "./AuthContext";

const NotifContext = createContext();

const CLAVE_VISTAS_TECNICO_BASE = "prerevisiones_vistas";
const CLAVE_VISTAS_ADMIN = "prerevisiones_pendientes_orden_vistas";
const CLAVE_VISTAS_ORDENES_BASE = "ordenes_asignadas_vistas";

const getVistas = (clave) => {
    try {
        return new Set(JSON.parse(localStorage.getItem(clave) || "[]"));
    } catch {
        return new Set();
    }
};

export const NotifProvider = ({ children }) => {
    const { esAdmin, esTecnico, userId } = useAuth();
    const [ordenesEsperando] = useState(0);
    const [preRevisionesNuevas, setPreRevisionesNuevas] = useState(0);
    const [pendientesOrdenNuevas, setPendientesOrdenNuevas] = useState(0);
    const [ordenesNuevasParaTecnico, setOrdenesNuevasParaTecnico] = useState(0);
    const [hayReajustePendiente, setHayReajustePendiente] = useState(false);
    const [hayAprobacionPendiente, setHayAprobacionPendiente] = useState(false);

    // Cada técnico tiene su PROPIA clave de "vistas" -- si no, un técnico distinto
    // usando el mismo navegador vería el badge de otro técnico ya "leído" por error
    const claveVistasTecnico = `${CLAVE_VISTAS_TECNICO_BASE}_${userId}`;
    const claveVistasOrdenes = `${CLAVE_VISTAS_ORDENES_BASE}_${userId}`;

    const actualizarNotifs = useCallback(async () => {
        if (esAdmin) return;
        // TODO: implementar cuando la ruta mis-ordenes esté lista
    }, [esAdmin]);

    // Cuenta cuántas pre-revisiones asignadas al Técnico todavía no ha "visto"
    const actualizarPreRevisionesNuevas = useCallback(async () => {
        if (!esTecnico) return;
        try {
            const res = await axios.get("/api/pre_revision/listar", {
                params: { _t: Date.now() }
            });
            const vistas = getVistas(claveVistasTecnico);
            const nuevas = res.data.filter(pr => pr.estado === "PENDIENTE" && !vistas.has(pr.id_pre_revision));
            setPreRevisionesNuevas(nuevas.length);
        } catch {
            // silencioso
        }
    }, [esTecnico, claveVistasTecnico]);

    // Cuenta cuántas pre-revisiones COMPLETADAS (que requieren reparación, sin
    // orden generada todavía) el Admin todavía no ha "visto"
    const actualizarPendientesOrden = useCallback(async () => {
        if (!esAdmin) return;
        try {
            const res = await axios.get("/api/pre_revision/pendientes-orden", {
                params: { _t: Date.now() }
            });
            const vistas = getVistas(CLAVE_VISTAS_ADMIN);
            const nuevas = res.data.filter(pr => !vistas.has(pr.id_pre_revision));
            setPendientesOrdenNuevas(nuevas.length);
        } catch {
            // silencioso
        }
    }, [esAdmin]);

    // Cuenta cuántas órdenes ASIGNADA (recién creadas por el Admin desde una
    // Pre-revisión) el Técnico todavía no ha "visto" en "Mis Órdenes", y si tiene
    // alguna orden EN PROCESO con un reajuste pendiente de resolver
    const actualizarOrdenesNuevas = useCallback(async () => {
        if (!esTecnico) return;
        try {
            const res = await axios.get("/api/ordenes_de_servicio/mis-ordenes", {
                params: { _t: Date.now() }
            });
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const vistas = getVistas(claveVistasOrdenes);
            const nuevas = data.filter(o => o.nombre_estado === "ASIGNADA" && !vistas.has(o.id_orden));
            setOrdenesNuevasParaTecnico(nuevas.length);

            // No depende de localStorage: se basa en el estado real de la orden.
            // Desaparece sola en cuanto el Técnico envía la cotización de nuevo
            // (deja de estar EN PROCESO), sin necesidad de "marcar como vista".
            const conReajuste = data.some(o => o.nombre_estado === "EN PROCESO" && o.motivo_rechazo);
            setHayReajustePendiente(conReajuste);

            // Cotización ya aprobada por el Cliente, lista para finalizar --
            // desaparece sola en cuanto el Técnico finaliza la orden
            const conAprobacion = data.some(o => o.nombre_estado === "EN PROCESO" && o.tiene_insumos && !o.motivo_rechazo);
            setHayAprobacionPendiente(conAprobacion);
        } catch {
            // silencioso
        }
    }, [esTecnico, claveVistasOrdenes]);

    // El Técnico llama a esto al entrar a "Mis Pre-revisiones"
    const marcarPreRevisionesVistas = useCallback((idsVisibles) => {
        const vistas = getVistas(claveVistasTecnico);
        idsVisibles.forEach(id => vistas.add(id));
        localStorage.setItem(claveVistasTecnico, JSON.stringify([...vistas]));
        setPreRevisionesNuevas(0);
    }, [claveVistasTecnico]);

    // El Admin llama a esto al entrar a "Pre-revisiones"
    const marcarPendientesOrdenVistas = useCallback((idsVisibles) => {
        const vistas = getVistas(CLAVE_VISTAS_ADMIN);
        idsVisibles.forEach(id => vistas.add(id));
        localStorage.setItem(CLAVE_VISTAS_ADMIN, JSON.stringify([...vistas]));
        setPendientesOrdenNuevas(0);
    }, []);

    // El Técnico llama a esto al entrar a "Mis Órdenes"
    const marcarOrdenesVistas = useCallback((idsVisibles) => {
        const vistas = getVistas(claveVistasOrdenes);
        idsVisibles.forEach(id => vistas.add(id));
        localStorage.setItem(claveVistasOrdenes, JSON.stringify([...vistas]));
        setOrdenesNuevasParaTecnico(0);
    }, [claveVistasOrdenes]);

    useEffect(() => {
        actualizarNotifs();
        actualizarPreRevisionesNuevas();
        actualizarPendientesOrden();
        actualizarOrdenesNuevas();
        const interval = setInterval(() => {
            actualizarNotifs();
            actualizarPreRevisionesNuevas();
            actualizarPendientesOrden();
            actualizarOrdenesNuevas();
        }, 3000); // cada 3 segundos, en vez de 10
        return () => clearInterval(interval);
    }, [actualizarNotifs, actualizarPreRevisionesNuevas, actualizarPendientesOrden, actualizarOrdenesNuevas]);

    useEffect(() => {
        const handler = () => {
            actualizarNotifs();
            actualizarPreRevisionesNuevas();
            actualizarPendientesOrden();
            actualizarOrdenesNuevas();
        };
        window.addEventListener('ordenActualizada', handler);
        window.addEventListener('disponibilidadCambiada', handler);
        return () => {
            window.removeEventListener('ordenActualizada', handler);
            window.removeEventListener('disponibilidadCambiada', handler);
        };
    }, [actualizarNotifs, actualizarPreRevisionesNuevas, actualizarPendientesOrden, actualizarOrdenesNuevas]);

    return (
        <NotifContext.Provider value={{
            ordenesEsperando,
            actualizarNotifs,
            preRevisionesNuevas,
            marcarPreRevisionesVistas,
            pendientesOrdenNuevas,
            marcarPendientesOrdenVistas,
            ordenesNuevasParaTecnico,
            marcarOrdenesVistas,
            hayReajustePendiente,
            hayAprobacionPendiente
        }}>
            {children}
        </NotifContext.Provider>
    );
};

export const useNotif = () => useContext(NotifContext);