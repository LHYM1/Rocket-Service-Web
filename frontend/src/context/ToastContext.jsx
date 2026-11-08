import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    // Ahora es una LISTA de avisos (antes solo se guardaba uno, y el siguiente
    // borraba al anterior) -- así pueden convivir varios al tiempo, apilados.
    const [toasts, setToasts] = useState([]);

    // opciones: { persistente: bool, link: string, textoLink: string }
    const mostrarToast = useCallback((mensaje, tipo = "success", opciones = {}) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((prev) => [...prev, { id, mensaje, tipo, ...opciones }]);
        return id;
    }, []);

    const cerrarToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ mostrarToast, cerrarToast }}>
            {children}
            <div style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column-reverse",
                gap: "10px"
            }}>
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        mensaje={t.mensaje}
                        tipo={t.tipo}
                        persistente={t.persistente}
                        link={t.link}
                        textoLink={t.textoLink}
                        onClose={() => cerrarToast(t.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);