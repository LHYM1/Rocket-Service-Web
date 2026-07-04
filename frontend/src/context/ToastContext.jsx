import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const mostrarToast = useCallback((mensaje, tipo = "success") => {
        setToast({ mensaje, tipo });
    }, []);

    const cerrarToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}
            {toast && (
                <Toast
                    mensaje={toast.mensaje}
                    tipo={toast.tipo}
                    onClose={cerrarToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);