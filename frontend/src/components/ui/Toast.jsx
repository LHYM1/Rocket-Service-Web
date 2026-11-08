import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Toast = ({ mensaje, tipo = "success", onClose, persistente = false, link, textoLink }) => {
    const [saliendo, setSaliendo] = useState(false);
    const navigate = useNavigate();

    const DURACION_MS = 4200;

    useEffect(() => {
        if (persistente) return;
        const timer = setTimeout(() => {
            setSaliendo(true);
            setTimeout(() => onClose(), 300);
        }, DURACION_MS);
        return () => clearTimeout(timer);
    }, [onClose, persistente]);

    const handleClose = () => {
        setSaliendo(true);
        setTimeout(() => onClose(), 300);
    };

    const handleClickLink = () => {
        if (link) {
            navigate(link);
            handleClose();
        }
    };

    // Paleta ajustada para fondo oscuro, tipo tablero de instrumentos
    const colores = {
        success: { acento: "#4ade80", icon: "fa-check" },
        error:   { acento: "#f87171", icon: "fa-xmark" },
        warning: { acento: "#ff8c00", icon: "fa-triangle-exclamation" },
        info:    { acento: "#60a5fa", icon: "fa-circle-info" }
    };
    const c = colores[tipo] || colores.success;

    // El "medidor" es un arco de 270° (como un velocímetro), coloreado
    // con el acento del tipo de aviso y el resto en gris oscuro
    const arcoMedidor = `conic-gradient(${c.acento} 0deg 270deg, #2a2a2a 270deg 360deg)`;

    return (
        <div style={{
            animation: saliendo ? "rsToastSalida 0.3s ease forwards" : "rsToastEntrada 0.3s ease"
        }}>
            <style>{`
                @keyframes rsToastEntrada {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes rsToastSalida {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(20px); opacity: 0; }
                }
                @keyframes rsToastDepleccion {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>

            <div style={{
                backgroundColor: "#1a1a1a",
                borderRadius: "10px",
                padding: "14px 16px",
                boxShadow: "0 10px 32px rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                minWidth: "300px",
                maxWidth: "400px",
                position: "relative",
                overflow: "hidden",
                border: "1px solid #2a2a2a"
            }}>
                {/* Medidor circular tipo velocímetro, con el ícono centrado adentro */}
                <div style={{
                    width: "38px", height: "38px",
                    minWidth: "38px",
                    borderRadius: "50%",
                    background: arcoMedidor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: "2px",
                    transform: "rotate(45deg)"
                }}>
                    <div style={{
                        width: "29px", height: "29px",
                        borderRadius: "50%",
                        backgroundColor: "#1a1a1a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: "rotate(-45deg)"
                    }}>
                        <i className={`fa-solid ${c.icon}`} style={{ color: c.acento, fontSize: "0.85rem" }}></i>
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: "500", color: "#f0f0f0", display: "block", lineHeight: 1.4 }}>
                        {mensaje}
                    </span>

                    {link && (
                        <button
                            onClick={handleClickLink}
                            style={{
                                marginTop: "8px",
                                background: "none",
                                border: "none",
                                padding: 0,
                                color: c.acento,
                                fontWeight: "600",
                                fontSize: "0.8rem",
                                cursor: "pointer"
                            }}
                        >
                            {textoLink || "Ver ahora"} <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.68rem" }}></i>
                        </button>
                    )}
                </div>

                <button onClick={handleClose} style={{
                    background: "none", border: "none",
                    cursor: "pointer", color: "#6b7280", fontSize: "0.95rem",
                    marginTop: "2px", padding: "2px"
                }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Línea de "combustible" que se agota -- solo en los que se auto-cierran */}
                {!persistente && (
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, height: "3px",
                        backgroundColor: c.acento,
                        animation: `rsToastDepleccion ${DURACION_MS}ms linear forwards`
                    }}></div>
                )}
            </div>
        </div>
    );
};

export default Toast;