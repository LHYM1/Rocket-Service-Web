import { useEffect, useState } from "react";
import axios from "../axiosConfig";
import Lightbox from "./Lightbox";

// Pasos del seguimiento visual -- se resalta el paso actual según el estado real
const PASOS = [
    { clave: "ASIGNADA", label: "Asignada", icon: "fa-user-check" },
    { clave: "EN PROCESO", label: "En proceso", icon: "fa-screwdriver-wrench" },
    { clave: "FINALIZADA", label: "Finalizada", icon: "fa-flag-checkered" },
];

function ModalDetalleOrdenAdmin({ orden, onClose }) {
    const [fotos, setFotos] = useState([]);
    const [cargandoFotos, setCargandoFotos] = useState(true);
    const [fotoAbierta, setFotoAbierta] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Pequeño delay para que la animación de entrada se vea (backdrop + escala)
        requestAnimationFrame(() => setVisible(true));

        axios.get(`/api/imagenes_danos/por-orden/${orden.id_orden}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setFotos(data);
            })
            .catch(() => setFotos([]))
            .finally(() => setCargandoFotos(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 220);
    };

    const esCancelada = orden.nombre_estado === "CANCELADA";
    const esPendienteAprobacion = orden.nombre_estado === "PENDIENTE APROBACIÓN";

    // Índice del paso actual dentro de PASOS (para pintar la línea de progreso)
    const pasoActualIdx = esCancelada
        ? -1
        : esPendienteAprobacion
            ? 1 // Pendiente aprobación se muestra dentro de "En proceso"
            : PASOS.findIndex(p => p.clave === orden.nombre_estado);

    return (
        <>
            <div
                onClick={handleClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 9998,
                    backgroundColor: "rgba(10,10,15,0.72)",
                    backdropFilter: "blur(3px)",
                    opacity: visible ? 1 : 0,
                    transition: "opacity 0.22s ease",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "20px"
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: "white",
                        borderRadius: "16px",
                        width: "100%", maxWidth: "620px",
                        maxHeight: "88vh",
                        overflowY: "auto",
                        transform: visible ? "scale(1)" : "scale(0.92)",
                        opacity: visible ? 1 : 0,
                        transition: "transform 0.22s cubic-bezier(0.34,1.3,0.64,1), opacity 0.22s ease",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.4)"
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                    }}>
                        <div>
                            <h4 style={{ margin: 0, color: "#1a1a2e", fontWeight: 700 }}>
                                {orden.codigo_orden || `ORD-${String(orden.id_orden).padStart(3, "0")}`}
                            </h4>
                            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                                {orden.nombre_cliente} · {orden.placa_moto}
                            </p>
                        </div>
                        <button onClick={handleClose} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#9ca3af", fontSize: "1.1rem", padding: "4px"
                        }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div style={{ padding: "24px" }}>
                        {/* Línea de progreso, o aviso de cancelada */}
                        {esCancelada ? (
                            <div style={{
                                backgroundColor: "#fef2f2", border: "1px solid #fca5a5",
                                borderRadius: "10px", padding: "14px 16px", marginBottom: "24px",
                                display: "flex", alignItems: "center", gap: "10px"
                            }}>
                                <i className="fa-solid fa-circle-xmark" style={{ color: "#dc2626", fontSize: "1.1rem" }}></i>
                                <div>
                                    <strong style={{ color: "#991b1b", fontSize: "14px" }}>Orden cancelada</strong>
                                    {orden.motivo_rechazo && (
                                        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#7f1d1d" }}>{orden.motivo_rechazo}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginBottom: "28px" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    {PASOS.map((paso, idx) => {
                                        const activo = idx <= pasoActualIdx;
                                        const esActual = idx === pasoActualIdx;
                                        return (
                                            <div key={paso.clave} style={{ display: "flex", alignItems: "center", flex: idx < PASOS.length - 1 ? 1 : "none" }}>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "72px" }}>
                                                    <div style={{
                                                        width: "36px", height: "36px", borderRadius: "50%",
                                                        backgroundColor: activo ? "#ff7300" : "#f0f0f0",
                                                        color: activo ? "white" : "#9ca3af",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        boxShadow: esActual ? "0 0 0 4px #ff730025" : "none",
                                                        transition: "all 0.3s"
                                                    }}>
                                                        <i className={`fa-solid ${paso.icon}`} style={{ fontSize: "0.85rem" }}></i>
                                                    </div>
                                                    <span style={{ fontSize: "11px", marginTop: "6px", color: activo ? "#1a1a2e" : "#9ca3af", fontWeight: esActual ? 700 : 500, textAlign: "center" }}>
                                                        {paso.label}
                                                    </span>
                                                </div>
                                                {idx < PASOS.length - 1 && (
                                                    <div style={{
                                                        flex: 1, height: "3px", marginBottom: "20px",
                                                        backgroundColor: idx < pasoActualIdx ? "#ff7300" : "#f0f0f0",
                                                        transition: "background-color 0.3s"
                                                    }}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {esPendienteAprobacion && (
                                    <p style={{ textAlign: "center", fontSize: "12px", color: "#ff7300", marginTop: "10px", fontWeight: 600 }}>
                                        Esperando que el cliente apruebe la cotización
                                    </p>
                                )}
                                {orden.motivo_rechazo && !esCancelada && (
                                    <div style={{
                                        backgroundColor: "#fff8ee", border: "1px solid #ff8c0040",
                                        borderRadius: "8px", padding: "10px 14px", marginTop: "12px", fontSize: "13px", color: "#9a5b00"
                                    }}>
                                        <i className="fa-solid fa-rotate me-2"></i>
                                        <strong>Reajuste solicitado por el cliente:</strong> {orden.motivo_rechazo}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Datos generales */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                            <Dato label="Cliente" valor={orden.nombre_cliente} />
                            <Dato label="Técnico asignado" valor={orden.nombre_tecnico || "Sin asignar"} />
                            <Dato label="Motocicleta" valor={`${orden.nombre_modelo || ""} · ${orden.placa_moto || ""}`} />
                            <Dato label="Tipo de servicio" valor={orden.nombre_servicio} />
                            <Dato label="Fecha de creación" valor={orden.fecha_de_creacion ? new Date(orden.fecha_de_creacion).toLocaleDateString('es-CO') : "—"} />
                            <Dato label="Entrega estimada" valor={orden.fecha_finalizacion_estimada ? new Date(orden.fecha_finalizacion_estimada).toLocaleDateString('es-CO') : "—"} />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "4px" }}>Descripción del problema</span>
                            <p style={{ margin: 0, fontSize: "14px", color: "#1a1a2e", lineHeight: 1.5 }}>{orden.descripcion_del_problema || "Sin descripción registrada."}</p>
                        </div>

                        {/* Fotos */}
                        <div>
                            <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                                Evidencias fotográficas
                            </span>
                            {cargandoFotos ? (
                                <p style={{ fontSize: "13px", color: "#9ca3af" }}><i className="fa-solid fa-spinner fa-spin me-2"></i>Cargando fotos...</p>
                            ) : fotos.length === 0 ? (
                                <p style={{ fontSize: "13px", color: "#9ca3af" }}>El técnico no ha subido fotos para esta orden.</p>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "8px" }}>
                                    {fotos.map((f, i) => (
                                        <img
                                            key={f.id_imagen || i}
                                            src={f.url_imagen}
                                            alt={`Evidencia ${i + 1}`}
                                            onClick={() => setFotoAbierta(i)}
                                            style={{
                                                width: "100%", height: "90px", objectFit: "cover",
                                                borderRadius: "8px", cursor: "pointer",
                                                border: "1px solid #f0f0f0"
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {fotoAbierta !== null && (
                <Lightbox
                    imagenes={fotos.map(f => f.url_imagen)}
                    indiceInicial={fotoAbierta}
                    onClose={() => setFotoAbierta(null)}
                />
            )}
        </>
    );
}

const Dato = ({ label, valor }) => (
    <div>
        <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, display: "block" }}>{label}</span>
        <span style={{ fontSize: "14px", color: "#1a1a2e", fontWeight: 500 }}>{valor || "—"}</span>
    </div>
);

export default ModalDetalleOrdenAdmin;