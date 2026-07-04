import { useEffect, useState } from "react";

const Toast = ({ mensaje, tipo = "success", onClose }) => {
    const [saliendo, setSaliendo] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSaliendo(true);
            setTimeout(() => onClose(), 300);
        }, 2700);
        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setSaliendo(true);
        setTimeout(() => onClose(), 300);
    };

    const colores = {
        success: { border: "#28a745", icono: "#28a745", bg: "#28a74520", icon: "fa-check" },
        error: { border: "#dc3545", icono: "#dc3545", bg: "#dc354520", icon: "fa-xmark" },
        warning: { border: "#ff8c00", icono: "#ff8c00", bg: "#ff8c0020", icon: "fa-triangle-exclamation" },
        info: { border: "#0d6efd", icono: "#0d6efd", bg: "#0d6efd20", icon: "fa-circle-info" }
    };

    const c = colores[tipo] || colores.success;

    return (
        <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
            animation: saliendo ? "slideDown 0.3s ease forwards" : "slideUp 0.3s ease"
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(80px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(80px); opacity: 0; }
                }
            `}</style>
            <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "16px 20px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: "300px",
                maxWidth: "400px",
                borderLeft: `4px solid ${c.border}`
            }}>
                <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "50%",
                    backgroundColor: c.bg,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", minWidth: "36px"
                }}>
                    <i className={`fa-solid ${c.icon}`} style={{ color: c.icono }}></i>
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "#333", flex: 1 }}>
                    {mensaje}
                </span>
                <button onClick={handleClose} style={{
                    background: "none", border: "none",
                    cursor: "pointer", color: "#999", fontSize: "1rem"
                }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    );
};

export default Toast;