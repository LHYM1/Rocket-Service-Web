import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useToast } from '../../context/ToastContext';
import ModalRechazarCotizacion from '../ModalRechazarCotizacion';
import ModalCalificarServicio from '../ModalCalificarServicio';
import ModalEvidenciasOrden from '../ModalEvidenciasOrden';
import ModalOrdenFinalizada from '../ModalOrdenFinalizada';
import ConfirmModal from '../ConfirmModal';

const coloresBadge = {
    "ASIGNADA": "bg-primary",
    "EN PROCESO": "bg-info text-dark",
    "PENDIENTE APROBACIÓN": "bg-warning text-dark",
    "FINALIZADA": "bg-success",
    "CANCELADA": "bg-secondary"
};

// Barra de progreso tipo "seguimiento de pedido" -- 3 fases visibles para el Cliente
function BarraProgreso({ estado }) {
    if (estado === "CANCELADA") {
        return (
            <div className="text-center py-2" style={{ color: "#dc3545", fontSize: "0.85rem" }}>
                <i className="fa-solid fa-circle-xmark me-1"></i>Orden cancelada
            </div>
        );
    }

    const fases = ["Recibida", "En reparación", "Finalizada"];
    let pasoActual = 0;
    if (estado === "ASIGNADA") pasoActual = 0;
    if (estado === "EN PROCESO" || estado === "PENDIENTE APROBACIÓN") pasoActual = 1;
    if (estado === "FINALIZADA") pasoActual = 2;

    return (
        <div className="d-flex align-items-center mb-3" style={{ padding: "0 4px" }}>
            {fases.map((fase, i) => (
                <div key={fase} style={{ display: "flex", alignItems: "center", flex: i < fases.length - 1 ? 1 : "0 0 auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: "50%",
                            backgroundColor: i <= pasoActual ? "#ff8c00" : "#e5e7eb",
                            color: i <= pasoActual ? "white" : "#9ca3af",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: "700",
                            transition: "background-color 0.3s"
                        }}>
                            {i < pasoActual ? <i className="fa-solid fa-check" style={{ fontSize: "0.65rem" }}></i> : i + 1}
                        </div>
                        <span style={{ fontSize: "0.65rem", color: i <= pasoActual ? "#1a1a2e" : "#9ca3af", marginTop: 4, whiteSpace: "nowrap", fontWeight: i === pasoActual ? "700" : "400" }}>
                            {fase}
                        </span>
                    </div>
                    {i < fases.length - 1 && (
                        <div style={{
                            flex: 1, height: 3, margin: "0 4px", marginBottom: 16,
                            backgroundColor: i < pasoActual ? "#ff8c00" : "#e5e7eb",
                            transition: "background-color 0.3s"
                        }}></div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ClienteOrdersTable({ ordenes, getOrdenes }) {
    const { mostrarToast } = useToast();
    const [detalle, setDetalle] = useState({});
    const [ordenAbierta, setOrdenAbierta] = useState(null);
    const [paraRechazar, setParaRechazar] = useState(null);
    const [paraCalificar, setParaCalificar] = useState(null);
    const [yaCalificadas, setYaCalificadas] = useState({});
    const [paraAceptarFinalizada, setParaAceptarFinalizada] = useState(null);

    // Órdenes finalizadas que el Cliente ya "aceptó" (le salió el aviso y le dio Aceptar)
    const claveAceptadas = "ordenes_finalizadas_aceptadas";
    const getAceptadas = () => {
        try { return new Set(JSON.parse(localStorage.getItem(claveAceptadas) || "[]")); }
        catch { return new Set(); }
    };
    const aceptarFinalizada = (id_orden) => {
        const aceptadas = getAceptadas();
        aceptadas.add(id_orden);
        localStorage.setItem(claveAceptadas, JSON.stringify([...aceptadas]));
        setParaAceptarFinalizada(null);
    };
    const [paraAprobar, setParaAprobar] = useState(null);
    const [paraVerEvidencias, setParaVerEvidencias] = useState(null);
    const [notisPorOrden, setNotisPorOrden] = useState({}); // { id_orden: cantidad }

    const cargarNotisPorOrden = () => {
        axios.get("/api/notificaciones/no-leidas-por-orden")
            .then(res => {
                const mapa = {};
                res.data.forEach(n => { mapa[n.id_orden] = n.cantidad; });
                setNotisPorOrden(mapa);
            })
            .catch(() => {});
    };

    useEffect(() => {
        ordenes.forEach(o => {
            if (o.nombre_estado === "FINALIZADA" && yaCalificadas[o.id_orden] === undefined) {
                axios.get(`/api/calificaciones/orden/${o.id_orden}`)
                    .then(res => setYaCalificadas(prev => ({ ...prev, [o.id_orden]: !!res.data })))
                    .catch(() => {});
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordenes]);

    // Detecta la primera orden finalizada que el Cliente todavía no ha "aceptado"
    // (visto el aviso de "ya puedes recoger tu moto"), y le muestra el modal
    useEffect(() => {
        if (paraAceptarFinalizada) return; // ya hay uno mostrándose, no interrumpir
        const aceptadas = getAceptadas();
        const pendiente = ordenes.find(o => o.nombre_estado === "FINALIZADA" && !aceptadas.has(o.id_orden));
        if (pendiente) setParaAceptarFinalizada(pendiente);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordenes]);

    useEffect(() => {
        cargarNotisPorOrden();

        // Polling: revisa si hay notificaciones nuevas cada 15 segundos,
        // mientras el Cliente tenga esta pantalla abierta (sin necesitar recargar)
        const intervalo = setInterval(cargarNotisPorOrden, 15000);
        return () => clearInterval(intervalo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const abrirEvidencias = (orden) => {
        setParaVerEvidencias(orden);
        // Al abrir, se marcan como leídas las notificaciones de ESA orden
        if (notisPorOrden[orden.id_orden]) {
            axios.patch(`/api/notificaciones/marcar-leidas-orden/${orden.id_orden}`)
                .then(() => setNotisPorOrden(prev => ({ ...prev, [orden.id_orden]: 0 })))
                .catch(() => {});
        }
    };

    const verDetalle = (idOrden) => {
        if (ordenAbierta === idOrden) {
            setOrdenAbierta(null);
            return;
        }
        setOrdenAbierta(idOrden);
        if (!detalle[idOrden]) {
            axios.get(`/api/ordenes_de_servicio/consultar/${idOrden}`)
                .then(res => setDetalle(prev => ({ ...prev, [idOrden]: { insumos: res.data.insumos, total: res.data.total } })))
                .catch(() => {});
        }
    };

    const aprobar = (idOrden) => {
        setParaAprobar(idOrden);
    };

    const confirmarAprobar = () => {
        const idOrden = paraAprobar;
        setParaAprobar(null);
        axios.patch(`/api/ordenes_de_servicio/aprobar/${idOrden}`)
            .then(res => { mostrarToast(res.data.message, "success"); getOrdenes(); })
            .catch(err => mostrarToast(err.response?.data?.message || "No se pudo aprobar.", "error"));
    };

    if (!ordenes || ordenes.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fa-solid fa-motorcycle" style={{ fontSize: "4rem", color: "#ff8c0050" }}></i>
                <h4 className="mt-3 fw-bold text-muted">No tienes órdenes activas</h4>
                <p className="text-muted">Cuando lleves tu moto al taller, verás el estado aquí.</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes entradaOrdenCliente {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cliente-card-animada { animation: entradaOrdenCliente 0.4s ease both; }
                .cliente-card-animada:nth-child(1) { animation-delay: 0s; }
                .cliente-card-animada:nth-child(2) { animation-delay: 0.07s; }
                .cliente-card-animada:nth-child(3) { animation-delay: 0.14s; }
                .cliente-card-animada:nth-child(4) { animation-delay: 0.21s; }
                .cliente-card-animada:nth-child(5) { animation-delay: 0.28s; }
                .cliente-card-animada:nth-child(6) { animation-delay: 0.35s; }

                @keyframes notiPop {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }
            `}</style>

            <div className="row g-4 align-items-start">
                {ordenes.map(o => (
                    <div key={o.id_orden} className="col-md-6 col-lg-4 cliente-card-animada">
                        <div className="card h-100 shadow border-0" style={{ borderRadius: "14px", overflow: "hidden" }}>
                            <div className="card-header d-flex justify-content-between align-items-center px-3"
                                style={{ backgroundColor: "#1a1a2e", color: "white", minHeight: "60px" }}>
                                <span className="fw-bold fs-6">
                                    <i className="fa-solid fa-motorcycle me-2"></i>{o.codigo_orden}
                                </span>
                                <span className={`badge fs-6 px-3 py-2 ${coloresBadge[o.nombre_estado] || "bg-secondary"}`}>
                                    {o.nombre_estado}
                                </span>
                            </div>

                            <div className="card-body py-3 px-3">
                                <BarraProgreso estado={o.nombre_estado} />
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-motorcycle" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>MOTOCICLETA</small>
                                        <span className="fw-semibold">{o.placa_moto} <span className="text-muted">— {o.nombre_modelo}</span></span>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-helmet-safety" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>TÉCNICO ASIGNADO</small>
                                        <span className="fw-semibold">{o.nombre_tecnico || "Por asignar"}</span>
                                    </div>
                                </div>

                                <div className="p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                                    <small className="text-muted d-block mb-1" style={{ fontSize: "0.7rem" }}>PROBLEMA REPORTADO</small>
                                    <span style={{ fontSize: "0.85rem" }}>{o.descripcion_del_problema || "Sin descripción"}</span>
                                </div>
                            </div>

                            <div className="card-footer bg-white border-top pt-2 pb-3 px-3">
                                <div className="d-flex justify-content-between mb-3">
                                    <small className="text-muted">Ingreso: {new Date(o.fecha_de_creacion).toLocaleDateString()}</small>
                                    <small className="text-muted">
                                        Entrega: {o.fecha_finalizacion_estimada ? new Date(o.fecha_finalizacion_estimada).toLocaleDateString() : "Por definir"}
                                    </small>
                                </div>

                                <button
                                    className="btn btn-sm w-100 mb-2"
                                    style={{ backgroundColor: "#f8f9fa", color: "#1a1a2e", border: "1px solid #e5e7eb", position: "relative" }}
                                    onClick={() => abrirEvidencias(o)}>
                                    <i className="fa-solid fa-images me-1"></i>Evidencias
                                    {notisPorOrden[o.id_orden] > 0 && (
                                        <span style={{
                                            position: "absolute", top: -6, right: -6,
                                            backgroundColor: "#dc3545", color: "white",
                                            borderRadius: "50%", minWidth: 20, height: 20, padding: "0 4px",
                                            fontSize: "0.68rem", fontWeight: "700",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            boxShadow: "0 2px 6px rgba(220,53,69,0.5)",
                                            animation: "notiPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
                                        }}>
                                            {notisPorOrden[o.id_orden]}
                                        </span>
                                    )}
                                </button>

                                {o.nombre_estado === "PENDIENTE APROBACIÓN" && (
                                    <>
                                        {o.motivo_rechazo && (
                                            <div className="mb-2 p-2 rounded text-center" style={{ backgroundColor: "rgba(40,167,69,0.1)", border: "1px solid #28a74540", fontSize: "0.78rem", color: "#1e7e34" }}>
                                                <i className="fa-solid fa-rotate me-1"></i>
                                                <strong>Reajuste realizado</strong> — el técnico ajustó la cotización según lo que pediste.
                                            </div>
                                        )}
                                        <button
                                            className="btn btn-sm w-100 mb-2"
                                            style={{ backgroundColor: "#1a1a2e", color: "white" }}
                                            onClick={() => verDetalle(o.id_orden)}>
                                            <i className={`fa-solid ${ordenAbierta === o.id_orden ? "fa-chevron-up" : "fa-file-invoice-dollar"} me-1`}></i>
                                            {ordenAbierta === o.id_orden ? "Ocultar cotización" : "Ver cotización"}
                                        </button>

                                        {ordenAbierta === o.id_orden && detalle[o.id_orden] && (
                                            <div className="mb-2 p-2 rounded" style={{ backgroundColor: "#f8f9fa", fontSize: "0.82rem" }}>
                                                {detalle[o.id_orden].insumos.length === 0 ? (
                                                    <p className="text-muted fst-italic mb-0">Sin insumos cotizados</p>
                                                ) : (
                                                    detalle[o.id_orden].insumos.map(ins => (
                                                        <div key={ins.id_insumos_orden} className="d-flex justify-content-between">
                                                            <span>{ins.nombre_insumo} x{ins.cantidad}</span>
                                                            <span>${Number(ins.precio_unitario_snapshot * ins.cantidad).toLocaleString('es-CO')}</span>
                                                        </div>
                                                    ))
                                                )}
                                                <div className="d-flex justify-content-between fw-bold mt-1" style={{ color: "#ff8c00" }}>
                                                    <span>Total</span>
                                                    <span>${Number(detalle[o.id_orden].total).toLocaleString('es-CO')}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm text-white fw-semibold flex-fill" style={{ backgroundColor: "#28a745" }}
                                                onClick={() => aprobar(o.id_orden)}>
                                                <i className="fa-solid fa-check me-1"></i>Aprobar
                                            </button>
                                            <button className="btn btn-sm text-white fw-semibold flex-fill" style={{ backgroundColor: "#dc3545" }}
                                                onClick={() => setParaRechazar(o)}>
                                                <i className="fa-solid fa-xmark me-1"></i>Rechazar
                                            </button>
                                        </div>
                                    </>
                                )}

                                {o.nombre_estado === "FINALIZADA" && !yaCalificadas[o.id_orden] && getAceptadas().has(o.id_orden) && (
                                    <button className="btn btn-sm w-100 text-white fw-semibold" style={{ backgroundColor: "#ff8c00" }}
                                        onClick={() => setParaCalificar(o)}>
                                        <i className="fa-solid fa-star me-1"></i>Calificar servicio
                                    </button>
                                )}

                                {o.nombre_estado === "FINALIZADA" && yaCalificadas[o.id_orden] && (
                                    <div className="text-center text-muted fst-italic" style={{ fontSize: "0.85rem" }}>
                                        <i className="fa-solid fa-circle-check me-1" style={{ color: "#28a745" }}></i>
                                        Ya calificaste este servicio
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {paraRechazar && (
                <ModalRechazarCotizacion
                    orden={paraRechazar}
                    onClose={() => setParaRechazar(null)}
                    onSuccess={getOrdenes}
                />
            )}

            {paraCalificar && (
                <ModalCalificarServicio
                    orden={paraCalificar}
                    onClose={() => setParaCalificar(null)}
                    onSuccess={() => setYaCalificadas(prev => ({ ...prev, [paraCalificar.id_orden]: true }))}
                />
            )}

            {paraAprobar && (
                <ConfirmModal
                    title="¿Apruebas esta cotización?"
                    message="Tu moto entrará en reparación con los insumos y el valor que revisaste."
                    confirmLabel="Sí, aprobar"
                    icon="fa-solid fa-check"
                    onConfirm={confirmarAprobar}
                    onCancel={() => setParaAprobar(null)}
                />
            )}

            {paraVerEvidencias && (
                <ModalEvidenciasOrden
                    orden={paraVerEvidencias}
                    onClose={() => setParaVerEvidencias(null)}
                />
            )}

            {paraAceptarFinalizada && (
                <ModalOrdenFinalizada
                    orden={paraAceptarFinalizada}
                    onAceptar={() => aceptarFinalizada(paraAceptarFinalizada.id_orden)}
                />
            )}
        </>
    );
}

export default ClienteOrdersTable;