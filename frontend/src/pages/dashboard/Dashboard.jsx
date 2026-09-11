import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Dashboard.css';

const coloresBadge = {
    "ASIGNADA": "#3b82f6",
    "EN PROCESO": "#0dcaf0",
    "PENDIENTE APROBACIÓN": "#f59e0b",
    "FINALIZADA": "#22c55e",
    "CANCELADA": "#6b7280"
};

const coloresDisponibilidad = {
    "Disponible": "#22c55e",
    "Realizando servicio": "#ff8c00"
};

function EstrellasPromedio({ promedio }) {
    const llenas = Math.round(promedio);
    return (
        <span>
            {[1, 2, 3, 4, 5].map(n => (
                <i key={n} className={`fa-star ${n <= llenas ? "fa-solid" : "fa-regular"}`}
                    style={{ color: "#ff8c00", fontSize: "0.85rem" }}></i>
            ))}
            <span className="ms-1 fw-semibold" style={{ fontSize: "0.85rem" }}>{promedio}</span>
        </span>
    );
}

const Dashboard = () => {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [expandido, setExpandido] = useState(null); // id_tecnico cuyas reseñas están desplegadas
    const [expandidoOrden, setExpandidoOrden] = useState(null); // id_orden cuyo motivo de cancelación está desplegado

    useEffect(() => {
        axios.get("/api/dashboard/resumen")
            .then(res => setDatos(res.data))
            .catch(err => console.error(err))
            .finally(() => setCargando(false));
    }, []);

    if (cargando) {
        return <div className="dashboard-page p-4"><p className="text-muted">Cargando dashboard...</p></div>;
    }

    if (!datos) {
        return <div className="dashboard-page p-4"><p className="text-danger">No se pudo cargar la información del dashboard.</p></div>;
    }

    const { conteos, ordenesRecientes, tecnicos, resenas, preRevisiones } = datos;

    const datosGrafico = resenas.map(r => ({
        nombre: r.nombre_tecnico.split(' ')[0], // solo el primer nombre, para que quepa en el eje
        promedio: Number(r.promedio)
    }));

    return (

        <div className="dashboard-page">
            <style>{`
                @keyframes entradaDash {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .dash-card-animada { animation: entradaDash 0.35s ease both; }
                .dash-card-animada:nth-child(1) { animation-delay: 0s; }
                .dash-card-animada:nth-child(2) { animation-delay: 0.06s; }
                .dash-card-animada:nth-child(3) { animation-delay: 0.12s; }
            `}</style>

            {/* Cards de resumen */}
            <div className="dash-container">
                <div className="dash-card-animada" style={cardEstilo}>
                    <div style={iconWrapEstilo("rgba(59,130,246,0.12)")}>
                        <i className="fa-solid fa-clipboard-list" style={{ color: "#3b82f6" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">Órdenes totales</small>
                        <span style={numEstilo}>{conteos.total}</span>
                    </div>
                </div>

                <div className="dash-card-animada" style={cardEstilo}>
                    <div style={iconWrapEstilo("rgba(245,158,11,0.12)")}>
                        <i className="fa-solid fa-hourglass-half" style={{ color: "#f59e0b" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">Órdenes pendientes</small>
                        <span style={numEstilo}>{conteos.pendientes}</span>
                    </div>
                </div>

                <div className="dash-card-animada" style={cardEstilo}>
                    <div style={iconWrapEstilo("rgba(34,197,94,0.12)")}>
                        <i className="fa-solid fa-circle-check" style={{ color: "#22c55e" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">Órdenes finalizadas</small>
                        <span style={numEstilo}>{conteos.finalizadas}</span>
                    </div>
                </div>
            </div>

            {/* Resumen de Pre-revisiones */}
            <h6 className="text-muted mt-4 mb-2" style={{ fontSize: "0.8rem", letterSpacing: "0.03em" }}>PRE-REVISIONES</h6>
            <div className="dash-container">
                <div className="dash-card-animada" style={cardEstiloChico}>
                    <div style={iconWrapEstilo("rgba(107,114,128,0.12)")}>
                        <i className="fa-solid fa-clock" style={{ color: "#6b7280" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">Pendientes</small>
                        <span style={numEstiloChico}>{preRevisiones.pendientes}</span>
                    </div>
                </div>

                <div className="dash-card-animada" style={cardEstiloChico}>
                    <div style={iconWrapEstilo("rgba(220,53,69,0.12)")}>
                        <i className="fa-solid fa-wrench" style={{ color: "#dc3545" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">Requieren reparación</small>
                        <span style={numEstiloChico}>{preRevisiones.requierenReparacion}</span>
                    </div>
                </div>

                <div className="dash-card-animada" style={cardEstiloChico}>
                    <div style={iconWrapEstilo("rgba(34,197,94,0.12)")}>
                        <i className="fa-solid fa-thumbs-up" style={{ color: "#22c55e" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">No requirieron reparación</small>
                        <span style={numEstiloChico}>{preRevisiones.noRequierenReparacion}</span>
                    </div>
                </div>

                <div className="dash-card-animada" style={cardEstiloChico}>
                    <div style={iconWrapEstilo("rgba(59,130,246,0.12)")}>
                        <i className="fa-solid fa-magnifying-glass" style={{ color: "#3b82f6" }}></i>
                    </div>
                    <div>
                        <small className="text-muted d-block">Total</small>
                        <span style={numEstiloChico}>{preRevisiones.total}</span>
                    </div>
                </div>
            </div>

            {/* Órdenes recientes + Disponibilidad técnicos */}
            <div className="main-section">
                <div className="ordenes-container">
                    <h3 className="ordenes-title">Órdenes recientes</h3>
                    <div className="ordenes-list">
                        {ordenesRecientes.length === 0 ? (
                            <p className="text-muted p-3">No hay órdenes registradas todavía.</p>
                        ) : (
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Orden</th>
                                        <th>Cliente</th>
                                        <th>Técnico</th>
                                        <th>Servicio</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenesRecientes.map(o => (
                                        <>
                                            <tr key={o.id_orden}
                                                onClick={() => o.nombre_estado === "CANCELADA" && setExpandidoOrden(exp => exp === o.id_orden ? null : o.id_orden)}
                                                style={{ cursor: o.nombre_estado === "CANCELADA" ? "pointer" : "default" }}>
                                                <td className="fw-semibold">{o.codigo_orden}</td>
                                                <td>{o.nombre_cliente || "—"}</td>
                                                <td>{o.nombre_tecnico || "Sin asignar"}</td>
                                                <td>{o.nombre_servicio || "—"}</td>
                                                <td>
                                                    <span className="badge" style={{ backgroundColor: coloresBadge[o.nombre_estado] || "#6b7280" }}>
                                                        {o.nombre_estado}
                                                    </span>
                                                    {o.nombre_estado === "CANCELADA" && (
                                                        <i className={`fa-solid fa-chevron-${expandidoOrden === o.id_orden ? "down" : "right"} ms-2`}
                                                           style={{ fontSize: "0.65rem", color: "#9ca3af" }}></i>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandidoOrden === o.id_orden && (
                                                <tr>
                                                    <td colSpan={5} style={{ backgroundColor: "#fff5f5", padding: "10px 20px", fontSize: "0.85rem" }}>
                                                        <strong style={{ color: "#dc3545" }}>Motivo de cancelación:</strong>{" "}
                                                        {o.motivo_rechazo || <span className="fst-italic text-muted">No se registró un motivo.</span>}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="tecnicos-container">
                    <h3 className="tecnicos-title">
                        <i className="fa-solid fa-users me-2" style={{ color: "#ff8c00" }}></i>
                        Disponibilidad técnicos
                    </h3>
                    <div className="tecnicos-list">
                        {tecnicos.length === 0 ? (
                            <p className="text-muted p-3">No hay técnicos registrados.</p>
                        ) : (
                            tecnicos.map(t => (
                                <div key={t.id_usuario} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded"
                                    style={{ backgroundColor: "#f8f9fa" }}>
                                    <span className="fw-semibold">{t.nombre} {t.apellido}</span>
                                    <span className="badge" style={{ backgroundColor: coloresDisponibilidad[t.disponibilidad] || "#6b7280" }}>
                                        {t.disponibilidad}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Reseñas de técnicos: tabla + gráfico */}
            <div className="main-section" style={{ marginTop: "24px" }}>
                <div className="ordenes-container">
                    <h3 className="ordenes-title">Reseñas de técnicos</h3>
                    <div className="ordenes-list">
                        {resenas.length === 0 ? (
                            <p className="text-muted p-3">Todavía no hay calificaciones de clientes.</p>
                        ) : (
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: 30 }}></th>
                                        <th>Técnico</th>
                                        <th>Promedio</th>
                                        <th>Total reseñas</th>
                                        <th>Última reseña</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resenas.map(r => (
                                        <>
                                            <tr key={r.id_tecnico}
                                                onClick={() => setExpandido(exp => exp === r.id_tecnico ? null : r.id_tecnico)}
                                                style={{ cursor: "pointer" }}>
                                                <td className="text-center">
                                                    <i className={`fa-solid fa-chevron-${expandido === r.id_tecnico ? "down" : "right"}`}
                                                       style={{ fontSize: "0.7rem", color: "#9ca3af" }}></i>
                                                </td>
                                                <td className="fw-semibold">{r.nombre_tecnico}</td>
                                                <td><EstrellasPromedio promedio={Number(r.promedio)} /></td>
                                                <td>{Number(r.total)}</td>
                                                <td className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                    {r.resenas?.[0]?.comentario || <span className="fst-italic">Sin comentario</span>}
                                                </td>
                                            </tr>
                                            {expandido === r.id_tecnico && (
                                                <tr>
                                                    <td colSpan={5} style={{ backgroundColor: "#f8f9fa", padding: 0 }}>
                                                        <div style={{ padding: "12px 20px" }}>
                                                            {r.resenas.map((res, i) => (
                                                                <div key={i} style={{
                                                                    padding: "10px 0",
                                                                    borderBottom: i < r.resenas.length - 1 ? "1px solid #e5e7eb" : "none"
                                                                }}>
                                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                                        <EstrellasPromedio promedio={res.calificacion} />
                                                                        <small className="text-muted">
                                                                            {res.codigo_orden} — {new Date(res.fecha).toLocaleDateString('es-CO')}
                                                                        </small>
                                                                    </div>
                                                                    <p className="mb-1" style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                                                                        <i className="fa-solid fa-user me-1"></i>{res.nombre_cliente || "Cliente"}
                                                                    </p>
                                                                    <p className="mb-0" style={{ fontSize: "0.85rem", color: "#374151" }}>
                                                                        {res.comentario || <span className="fst-italic text-muted">Sin comentario</span>}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>


                </div>

                <div className="tecnicos-container">
                    <h3 className="tecnicos-title">Promedio por técnico</h3>
                    {datosGrafico.length === 0 ? (
                        <p className="text-muted p-3">Sin datos suficientes para graficar.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={datosGrafico} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 5]} />
                                <YAxis type="category" dataKey="nombre" width={70} />
                                <Tooltip />
                                <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                                    {datosGrafico.map((entry, index) => (
                                        <Cell key={index} fill="#ff8c00" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>

    );
};

const cardEstilo = {
    display: "flex", alignItems: "center", gap: "14px",
    backgroundColor: "#fff", borderRadius: "14px", padding: "18px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0"
};

const iconWrapEstilo = (bg) => ({
    width: "44px", height: "44px", borderRadius: "12px", backgroundColor: bg,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
});

const numEstilo = { fontSize: "1.6rem", fontWeight: "700", color: "#1a1a2e" };

const cardEstiloChico = {
    display: "flex", alignItems: "center", gap: "12px",
    backgroundColor: "#fff", borderRadius: "12px", padding: "14px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0"
};

const numEstiloChico = { fontSize: "1.3rem", fontWeight: "700", color: "#1a1a2e" };

export default Dashboard;