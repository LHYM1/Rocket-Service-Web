import axios from '../../axiosConfig';
import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNotif } from '../../context/NotifContext';
import ModalAgregarFotoOrden from '../ModalAgregarFotoOrden';
import ConfirmModal from '../ConfirmModal';

const coloresBadge = {
    "ASIGNADA": "bg-primary",
    "EN PROCESO": "bg-info text-dark",
    "PENDIENTE APROBACIÓN": "bg-warning text-dark",
    "FINALIZADA": "bg-success",
    "CANCELADA": "bg-secondary"
};

function OrdenesTable({ ordenes, setIdSeleccionado, getOrdenes, esAdmin }) {

    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState("");
    const [cantidadInsumo, setCantidadInsumo] = useState(1);

    const [ordenEnRevision, setOrdenEnRevision] = useState(null);
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [insumosDeLaOrden, setInsumosDeLaOrden] = useState([]);
    const [totalCotizado, setTotalCotizado] = useState(0);
    const [cargandoPanel, setCargandoPanel] = useState(false);
    const [tiposServicio, setTiposServicio] = useState([]);
    const [tieneCotizacionPrevia, setTieneCotizacionPrevia] = useState({});
    const [ordenParaFoto, setOrdenParaFoto] = useState(null);
    const [ordenParaFinalizar, setOrdenParaFinalizar] = useState(null);
    const [ordenParaFinalizarDirecto, setOrdenParaFinalizarDirecto] = useState(null);
    const [ordenParaCancelar, setOrdenParaCancelar] = useState(null); // id_orden -> true/false

    // Edición rápida de tipo de servicio / problema / fecha de entrega (Técnico)
    const [editandoDetalles, setEditandoDetalles] = useState(null); // id_orden que se está editando
    const [detallesEditados, setDetallesEditados] = useState({
        id_tipo_servicio: "", descripcion_del_problema: "", fecha_finalizacion_estimada: ""
    });

    const { mostrarToast } = useToast();
    const mostrarNotificacion = (mensaje, tipo = "success") => mostrarToast(mensaje, tipo);
    const { marcarOrdenesVistas } = useNotif();

    const cargarInsumosDisponibles = () => {
        axios.get("/api/insumos/listar")
            .then(res => setInsumosDisponibles(res.data))
            .catch(err => console.error(err));
    };

    // Para saber si una orden EN PROCESO ya tuvo una cotización aprobada antes
    // (le muestra al Técnico un aviso, en vez de verse "igual que la primera vez")
    useEffect(() => {
        ordenes.forEach(o => {
            if (o.nombre_estado === "EN PROCESO" && tieneCotizacionPrevia[o.id_orden] === undefined) {
                axios.get(`/api/ordenes_de_servicio/consultar/${o.id_orden}`)
                    .then(res => {
                        setTieneCotizacionPrevia(prev => ({ ...prev, [o.id_orden]: (res.data.insumos || []).length > 0 }));
                    })
                    .catch(() => {});
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordenes]);

    useEffect(() => {
        cargarInsumosDisponibles();
        axios.get("/api/tipo_servicio/listar")
            .then(res => setTiposServicio(res.data))
            .catch(err => console.error(err));
    }, []);

    const abrirEdicionDetalles = (o) => {
        setEditandoDetalles(o.id_orden);
        setDetallesEditados({
            id_tipo_servicio: o.id_tipo_servicio || "",
            descripcion_del_problema: o.descripcion_del_problema || "",
            fecha_finalizacion_estimada: o.fecha_finalizacion_estimada
                ? new Date(o.fecha_finalizacion_estimada).toISOString().split("T")[0]
                : ""
        });
    };

    const guardarDetalles = (idOrden) => {
        axios.put(`/api/ordenes_de_servicio/modificar/${idOrden}`, detallesEditados)
            .then(res => {
                mostrarNotificacion(res.data.message, "success");
                setEditandoDetalles(null);
                getOrdenes();
            })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo actualizar.", "error"));
    };

    const cargarDetalleOrden = (idOrden) => {
        setCargandoPanel(true);
        cargarInsumosDisponibles(); // refresca el stock real, por si cambió con la última acción
        axios.get(`/api/ordenes_de_servicio/consultar/${idOrden}`)
            .then(res => {
                setInsumosDeLaOrden(res.data.insumos || []);
                setTotalCotizado(res.data.total || 0);
            })
            .catch(err => console.error(err))
            .finally(() => setCargandoPanel(false));
    };

    const abrirPanel = (idOrden) => {
        setOrdenEnRevision(idOrden);
        cargarDetalleOrden(idOrden);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setPanelAbierto(true));
        });
    };

    const cerrarPanel = () => {
        setPanelAbierto(false);
        setTimeout(() => {
            setOrdenEnRevision(null);
            setInsumosDeLaOrden([]);
            setTotalCotizado(0);
        }, 380);
    };

    const eliminarOrden = (id, estado) => {
        if (estado === "FINALIZADA" || estado === "CANCELADA") {
            mostrarNotificacion("Esta orden ya no se puede cancelar.", "error");
            return;
        }
        setOrdenParaCancelar(id);
    };

    const confirmarCancelar = () => {
        const id = ordenParaCancelar;
        setOrdenParaCancelar(null);
        axios.patch(`/api/ordenes_de_servicio/cancelar/${id}`)
            .then(res => { mostrarNotificacion(res.data.message, "success"); getOrdenes(); })
            .catch(err => {
                mostrarNotificacion(err.response?.data?.message || "No se pudo cancelar la orden.", "error");
            });
    };

    const aceptarOrden = (idOrden) => {
        axios.patch(`/api/ordenes_de_servicio/aceptar/${idOrden}`)
            .then(res => {
                mostrarNotificacion(res.data.message, "success");
                window.dispatchEvent(new CustomEvent('disponibilidadCambiada', { detail: { estado: "Realizando servicio" } }));
                marcarOrdenesVistas([idOrden]); // recién aceptada -- ya no cuenta como "nueva" en el badge
                getOrdenes();
            })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo aceptar la orden.", "error"));
    };

    const agregarInsumo = (idOrden) => {
        if (!insumoSeleccionado || cantidadInsumo < 1) return;
        axios.post("/api/insumos_usados_en_servicio/agregar", {
            id_orden: idOrden,
            id_insumo: parseInt(insumoSeleccionado),
            cantidad: cantidadInsumo
        })
            .then(res => {
                mostrarNotificacion(res.data.message, "success");
                setInsumoSeleccionado("");
                setCantidadInsumo(1);
                cargarDetalleOrden(idOrden);
            })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo agregar el insumo.", "error"));
    };

    const quitarInsumo = (idInsumosOrden, idOrden) => {
        axios.delete(`/api/insumos_usados_en_servicio/quitar/${idInsumosOrden}`)
            .then(res => {
                mostrarNotificacion(res.data.message, "success");
                cargarDetalleOrden(idOrden);
            })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo quitar el insumo.", "error"));
    };

    const ajustarCantidad = (idInsumosOrden, idOrden, cantidadActual, delta) => {
        const nuevaCantidad = cantidadActual + delta;
        if (nuevaCantidad <= 0) {
            quitarInsumo(idInsumosOrden, idOrden);
            return;
        }
        axios.patch(`/api/insumos_usados_en_servicio/actualizar-cantidad/${idInsumosOrden}`, {
            nueva_cantidad: nuevaCantidad
        })
            .then(() => cargarDetalleOrden(idOrden))
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo ajustar la cantidad.", "error"));
    };

    const enviarCotizacion = (idOrden) => {
        if (insumosDeLaOrden.length === 0) {
            mostrarNotificacion("Agrega al menos un insumo antes de enviar la cotización.", "warning");
            return;
        }
        axios.patch(`/api/ordenes_de_servicio/enviar-cotizacion/${idOrden}`)
            .then(res => { mostrarNotificacion(res.data.message, "success"); cerrarPanel(); getOrdenes(); })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo enviar la cotización.", "error"));
    };

    const finalizarOrden = (idOrden) => {
        setOrdenParaFinalizar(idOrden);
    };

    const confirmarFinalizar = () => {
        const idOrden = ordenParaFinalizar;
        setOrdenParaFinalizar(null);
        axios.patch(`/api/ordenes_de_servicio/finalizar/${idOrden}`)
            .then(res => {
                mostrarNotificacion(res.data.message, "success");
                window.dispatchEvent(new CustomEvent('disponibilidadCambiada', { detail: { estado: "Disponible" } }));
                cerrarPanel();
                getOrdenes();
            })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo finalizar la orden.", "error"));
    };

    const finalizarDirecto = (idOrden) => {
        setOrdenParaFinalizarDirecto(idOrden);
    };

    const confirmarFinalizarDirecto = () => {
        const idOrden = ordenParaFinalizarDirecto;
        setOrdenParaFinalizarDirecto(null);
        axios.patch(`/api/ordenes_de_servicio/finalizar/${idOrden}`)
            .then(res => {
                mostrarNotificacion(res.data.message, "success");
                window.dispatchEvent(new CustomEvent('disponibilidadCambiada', { detail: { estado: "Disponible" } }));
                cerrarPanel();
                getOrdenes();
            })
            .catch(err => mostrarNotificacion(err.response?.data?.message || "No se pudo finalizar la orden.", "error"));
    };

    if (!ordenes || !Array.isArray(ordenes)) {
        return <p className="text-center">No hay órdenes de servicio disponibles</p>;
    }

    if (ordenes.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: "4rem", color: "#ff8c0050" }}></i>
                <h4 className="mt-3 fw-bold text-muted">No tienes órdenes asignadas</h4>
                <p className="text-muted">Cuando el administrador te asigne una orden aparecerá aquí.</p>
            </div>
        );
    }

    const insumosParaSelector = insumosDisponibles.filter(
        i => i.estado && !insumosDeLaOrden.some(iu => iu.nombre_insumo === i.nombre_insumo)
    );

    return (
        <>
            <style>{`
                @keyframes entradaOrden {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .orden-card-animada { animation: entradaOrden 0.4s ease both; }
                .orden-card-animada:nth-child(1) { animation-delay: 0s; }
                .orden-card-animada:nth-child(2) { animation-delay: 0.07s; }
                .orden-card-animada:nth-child(3) { animation-delay: 0.14s; }
                .orden-card-animada:nth-child(4) { animation-delay: 0.21s; }
                .orden-card-animada:nth-child(5) { animation-delay: 0.28s; }
                .orden-card-animada:nth-child(6) { animation-delay: 0.35s; }

                .panel-revision {
                    overflow: hidden;
                    transition: max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                                opacity    0.32s ease,
                                transform  0.32s ease,
                                padding    0.32s ease;
                    border-top: 2px solid #ff8c0030;
                }
                .panel-revision.panel-abierto {
                    max-height: 900px;
                    opacity: 1;
                    transform: translateY(0);
                    padding-top: 1rem;
                }
                .panel-revision.panel-cerrado {
                    max-height: 0;
                    opacity: 0;
                    transform: translateY(-8px);
                    padding-top: 0;
                }
            `}</style>

            <div className="row g-4 align-items-start">
                {ordenes.map((o) => (
                    <div key={`${o.id_orden}-${o.nombre_estado}`} className="col-md-6 col-lg-4 orden-card-animada">
                        <div className="card h-100 shadow border-0"
                            style={{ borderRadius: "14px", overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer" }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                            }}
                        >
                            <div className="card-header d-flex justify-content-between align-items-center px-3"
                                style={{ backgroundColor: "#1a1a2e", color: "white", minHeight: "60px" }}>
                                <span className="fw-bold fs-6">
                                    <i className="fa-solid fa-screwdriver-wrench me-2"></i>Orden #{o.id_orden}
                                </span>
                                <span className={`badge fs-6 px-3 py-2 ${coloresBadge[o.nombre_estado] || "bg-secondary"}`}>
                                    {o.nombre_estado}
                                </span>
                            </div>

                            <div className="card-body py-3 px-3">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-user" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>CLIENTE</small>
                                        <span className="fw-semibold">{o.nombre_cliente || "No definido"}</span>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-motorcycle" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>MOTOCICLETA</small>
                                        <span className="fw-semibold">
                                            {o.placa_moto || "No definida"}
                                            <span className="text-muted ms-1" style={{ fontSize: "0.85rem" }}>— {o.nombre_modelo || ""}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-helmet-safety" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>TÉCNICO</small>
                                        <span className="fw-semibold">{o.nombre_tecnico || "No asignado"}</span>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                            style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                            <i className="fa-solid fa-wrench" style={{ color: "#ff8c00" }}></i>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>SERVICIO</small>
                                            <span className="fw-semibold">{o.nombre_servicio || <span className="text-muted fst-italic">No definido</span>}</span>
                                        </div>
                                    </div>
                                    {!esAdmin && (o.nombre_estado === "EN PROCESO" || o.nombre_estado === "ASIGNADA") && (
                                        <button
                                            className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: "28px", height: "28px", backgroundColor: "#ff8c0020", color: "#ff8c00", border: "none" }}
                                            title="Editar"
                                            onClick={() => editandoDetalles === o.id_orden ? setEditandoDetalles(null) : abrirEdicionDetalles(o)}>
                                            <i className={`fa-solid ${editandoDetalles === o.id_orden ? "fa-xmark" : "fa-pen"}`} style={{ fontSize: "0.75rem" }}></i>
                                        </button>
                                    )}
                                </div>

                                {editandoDetalles === o.id_orden ? (
                                    <div className="p-2 rounded mb-3" style={{ backgroundColor: "#fff8ee", border: "1px solid #ff8c0040" }}>
                                        <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>Tipo de servicio</label>
                                        <select
                                            className="form-select form-select-sm mb-2"
                                            value={detallesEditados.id_tipo_servicio}
                                            onChange={e => setDetallesEditados({ ...detallesEditados, id_tipo_servicio: e.target.value })}>
                                            <option value="">Seleccione</option>
                                            {tiposServicio.map(ts => (
                                                <option key={ts.id_tipo_servicio} value={ts.id_tipo_servicio}>{ts.nombre_servicio}</option>
                                            ))}
                                        </select>

                                        <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>Problema</label>
                                        <textarea
                                            className="form-control form-control-sm mb-2"
                                            rows={2}
                                            value={detallesEditados.descripcion_del_problema}
                                            onChange={e => setDetallesEditados({ ...detallesEditados, descripcion_del_problema: e.target.value })}
                                        ></textarea>

                                        <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>Fecha de entrega</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm mb-2"
                                            value={detallesEditados.fecha_finalizacion_estimada}
                                            onChange={e => setDetallesEditados({ ...detallesEditados, fecha_finalizacion_estimada: e.target.value })}
                                        />

                                        <button
                                            className="btn btn-sm w-100 text-white fw-semibold"
                                            style={{ backgroundColor: "#28a745" }}
                                            onClick={() => guardarDetalles(o.id_orden)}>
                                            <i className="fa-solid fa-check me-1"></i>Guardar cambios
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                                        <small className="text-muted d-block mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                                            <i className="fa-solid fa-comment-dots me-1"></i>PROBLEMA
                                        </small>
                                        <span style={{ fontSize: "0.85rem" }}>
                                            {o.descripcion_del_problema || <span className="text-muted fst-italic">Sin descripción</span>}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer bg-white border-top pt-2 pb-3 px-3">
                                <div className="d-flex justify-content-between mb-3">
                                    <small className="text-muted">
                                        <i className="fa-regular fa-calendar me-1"></i>
                                        <strong>Creación:</strong> {new Date(o.fecha_de_creacion).toLocaleDateString()}
                                    </small>
                                    <small className="text-muted">
                                        <i className="fa-regular fa-calendar-check me-1"></i>
                                        <strong>Entrega:</strong>{" "}
                                        {o.fecha_finalizacion_estimada
                                            ? new Date(o.fecha_finalizacion_estimada).toLocaleDateString()
                                            : <span className="text-muted fst-italic">No definida</span>}
                                    </small>
                                </div>

                                {esAdmin ? (
                                    <div className="d-flex gap-2">
                                        <button onClick={() => setIdSeleccionado(o)}
                                            className="btn btn-sm flex-fill text-white fw-semibold"
                                            style={{ backgroundColor: "#ff8c00", borderColor: "#ff8c00" }}>
                                            <i className="fa-solid fa-pencil me-1"></i>Editar
                                        </button>
                                        <button onClick={() => eliminarOrden(o.id_orden, o.nombre_estado)}
                                            className="btn btn-danger btn-sm flex-fill fw-semibold"
                                            disabled={o.nombre_estado === "FINALIZADA" || o.nombre_estado === "CANCELADA"}>
                                            <i className="fa-solid fa-ban me-1"></i>Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">

                                        {o.nombre_estado === "EN PROCESO" && (
                                            <button
                                                onClick={() => setOrdenParaFoto(o)}
                                                className="btn btn-sm w-100"
                                                style={{ backgroundColor: "#f8f9fa", color: "#1a1a2e", border: "1px solid #e5e7eb" }}>
                                                <i className="fa-solid fa-camera me-1"></i>Agregar foto (daño/reparación)
                                            </button>
                                        )}

                                        {o.nombre_estado === "ASIGNADA" && (
                                            <button
                                                disabled
                                                title="Primero debes aceptar la orden para poder subir fotos"
                                                className="btn btn-sm w-100"
                                                style={{ backgroundColor: "#f1f3f5", color: "#adb5bd", border: "1px solid #e5e7eb", cursor: "not-allowed" }}>
                                                <i className="fa-solid fa-camera me-1"></i>Agregar foto (daño/reparación)
                                            </button>
                                        )}

                                        {o.nombre_estado === "ASIGNADA" && (
                                            <button
                                                onClick={() => aceptarOrden(o.id_orden)}
                                                className="btn btn-sm w-100 text-white fw-semibold"
                                                style={{ backgroundColor: "#ff8c00" }}>
                                                <i className="fa-solid fa-play me-1"></i>Aceptar Orden
                                            </button>
                                        )}

                                        {o.nombre_estado === "EN PROCESO" && tieneCotizacionPrevia[o.id_orden] && !o.motivo_rechazo && (
                                            <div className="text-center mb-1" style={{ fontSize: "0.78rem", color: "#28a745" }}>
                                                <i className="fa-solid fa-circle-check me-1"></i>
                                                Cotización aprobada por el cliente — continúa el trabajo
                                            </div>
                                        )}

                                        {o.nombre_estado === "EN PROCESO" && o.motivo_rechazo && (
                                            <div className="mb-2 p-2 rounded" style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc10740", fontSize: "0.8rem", color: "#856404" }}>
                                                <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                                <strong>El cliente pidió un reajuste:</strong> {o.motivo_rechazo}
                                            </div>
                                        )}

                                        {o.nombre_estado === "EN PROCESO" && tieneCotizacionPrevia[o.id_orden] && !o.motivo_rechazo ? (
                                            <button
                                                onClick={() => finalizarOrden(o.id_orden)}
                                                className="btn btn-sm w-100 text-white fw-semibold"
                                                style={{ backgroundColor: "#28a745" }}>
                                                <i className="fa-solid fa-check me-1"></i>Finalizar
                                            </button>
                                        ) : o.nombre_estado === "EN PROCESO" && (
                                            <button
                                                onClick={() => ordenEnRevision === o.id_orden ? cerrarPanel() : abrirPanel(o.id_orden)}
                                                className="btn btn-sm w-100 text-white fw-semibold"
                                                style={{ backgroundColor: ordenEnRevision === o.id_orden ? "#6c757d" : "#fd7e14" }}>
                                                <i className={`fa-solid ${ordenEnRevision === o.id_orden ? "fa-xmark" : "fa-boxes-stacked"} me-1`}></i>
                                                {ordenEnRevision === o.id_orden ? "Cerrar cotización" : "Cotizar / Finalizar"}
                                            </button>
                                        )}

                                        {o.nombre_estado === "PENDIENTE APROBACIÓN" && (
                                            <div className="text-center text-muted fst-italic" style={{ fontSize: "0.85rem" }}>
                                                <i className="fa-solid fa-hourglass-half me-1"></i>
                                                Esperando aprobación del cliente
                                                {o.motivo_rechazo && (
                                                    <div className="mt-1 text-danger" style={{ fontSize: "0.78rem" }}>
                                                        Último motivo de reajuste: {o.motivo_rechazo}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {o.nombre_estado === "EN PROCESO" && ordenEnRevision === o.id_orden && (
                                            <div className={`panel-revision ${panelAbierto ? "panel-abierto" : "panel-cerrado"}`}>

                                                <h6 className="fw-bold mb-3" style={{ color: "#1a1a2e", fontSize: "0.9rem" }}>
                                                    <i className="fa-solid fa-file-invoice-dollar me-2" style={{ color: "#ff8c00" }}></i>
                                                    Cotización de insumos
                                                </h6>

                                                {cargandoPanel ? (
                                                    <p className="text-muted small">Cargando...</p>
                                                ) : (
                                                    <>
                                                        <div className="d-flex gap-1 mb-2 align-items-center">
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={insumoSeleccionado}
                                                                onChange={e => setInsumoSeleccionado(e.target.value)}>
                                                                <option value="">Seleccione un insumo</option>
                                                                {insumosParaSelector.map(i => (
                                                                    <option key={i.id_insumo} value={i.id_insumo}>
                                                                        {i.nombre_insumo} (stock: {i.cantidad_disponible})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "70px" }}
                                                                min="1"
                                                                value={cantidadInsumo}
                                                                onChange={e => setCantidadInsumo(parseInt(e.target.value))}
                                                            />
                                                            <button
                                                                className="btn btn-sm text-white px-2"
                                                                style={{ backgroundColor: "#ff8c00" }}
                                                                onClick={() => agregarInsumo(o.id_orden)}>
                                                                <i className="fa-solid fa-plus"></i>
                                                            </button>
                                                        </div>

                                                        {insumosParaSelector.length === 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-warning fst-italic mb-1" style={{ fontSize: "0.75rem" }}>
                                                                    <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                                                    No hay insumos con stock disponible en este momento.
                                                                </p>
                                                                <button
                                                                    className="btn btn-danger btn-sm w-100"
                                                                    onClick={() => {
                                                                        axios.post("/api/notificaciones/crear", {
                                                                            mensaje: `El técnico reporta que no hay insumos con stock disponible para la orden #${o.id_orden}.`
                                                                        })
                                                                            .then(() => mostrarNotificacion("Se notificó al Administrador.", "success"))
                                                                            .catch(() => mostrarNotificacion("No se pudo enviar la notificación.", "error"));
                                                                    }}>
                                                                    <i className="fa-solid fa-bell me-1"></i>Notificar al Administrador
                                                                </button>
                                                            </div>
                                                        )}

                                                        {insumosDeLaOrden.length === 0 ? (
                                                            <p className="text-muted fst-italic mb-2" style={{ fontSize: "0.78rem" }}>
                                                                Sin insumos agregados
                                                            </p>
                                                        ) : (
                                                            <div className="d-flex flex-column gap-1 mb-2">
                                                                {insumosDeLaOrden.map(insumo => {
                                                                    const insumoOriginal = insumosDisponibles.find(i => i.id_insumo === insumo.id_insumo);
                                                                    const stockRestante = insumoOriginal ? insumoOriginal.cantidad_disponible : 0;
                                                                    return (
                                                                        <div key={insumo.id_insumos_orden}
                                                                            className="d-flex align-items-center justify-content-between p-1 rounded"
                                                                            style={{ backgroundColor: "#f8f9fa", fontSize: "0.82rem" }}>
                                                                            <span className="fw-semibold">{insumo.nombre_insumo}</span>
                                                                            <div className="d-flex align-items-center gap-1">
                                                                                <button className="btn btn-sm py-0 px-1" style={{ backgroundColor: "#e9ecef" }}
                                                                                    onClick={() => ajustarCantidad(insumo.id_insumos_orden, o.id_orden, insumo.cantidad, -1)}>
                                                                                    <i className="fa-solid fa-minus" style={{ fontSize: "0.65rem" }}></i>
                                                                                </button>
                                                                                <span className="badge" style={{ backgroundColor: "#ff8c00" }}>
                                                                                    {insumo.cantidad} {insumo.nombre_unidad}
                                                                                </span>
                                                                                <button className="btn btn-sm py-0 px-1" style={{ backgroundColor: "#e9ecef" }}
                                                                                    disabled={stockRestante <= 0}
                                                                                    onClick={() => ajustarCantidad(insumo.id_insumos_orden, o.id_orden, insumo.cantidad, 1)}>
                                                                                    <i className="fa-solid fa-plus" style={{ fontSize: "0.65rem" }}></i>
                                                                                </button>
                                                                                <span className="text-muted" style={{ fontSize: "0.7rem" }} title="Stock restante disponible">
                                                                                    (stock: {stockRestante})
                                                                                </span>
                                                                                <span className="text-muted">
                                                                                    ${Number(insumo.precio_unitario_snapshot * insumo.cantidad).toLocaleString('es-CO')}
                                                                                </span>
                                                                                <button className="btn btn-danger btn-sm py-0 px-1"
                                                                                    onClick={() => quitarInsumo(insumo.id_insumos_orden, o.id_orden)}>
                                                                                    <i className="fa-solid fa-trash" style={{ fontSize: "0.7rem" }}></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                <div className="text-end fw-bold" style={{ fontSize: "0.85rem", color: "#ff8c00" }}>
                                                                    Total: ${Number(totalCotizado).toLocaleString('es-CO')}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="d-flex gap-2 mt-2">
                                                            <button
                                                                className="btn text-white fw-semibold flex-fill btn-sm"
                                                                style={{ backgroundColor: "#28a745" }}
                                                                onClick={() => enviarCotizacion(o.id_orden)}>
                                                                <i className="fa-solid fa-paper-plane me-1"></i>Enviar cotización
                                                            </button>
                                                            <button
                                                                className="btn text-white fw-semibold flex-fill btn-sm"
                                                                disabled={totalCotizado > 0}
                                                                title={totalCotizado > 0 ? "Solo disponible cuando el total cotizado es $0 -- si hay costo, el cliente debe aprobarlo primero" : "El cliente estuvo presente y ya sabe qué se le va a hacer"}
                                                                style={{ backgroundColor: totalCotizado > 0 ? "#adb5bd" : "#6c757d", cursor: totalCotizado > 0 ? "not-allowed" : "pointer" }}
                                                                onClick={() => finalizarDirecto(o.id_orden)}>
                                                                <i className="fa-solid fa-check me-1"></i>Finalizar directo
                                                            </button>
                                                        </div>
                                                        <small className="text-muted d-block mt-1 text-center" style={{ fontSize: "0.72rem" }}>
                                                            {totalCotizado > 0
                                                                ? "\"Finalizar directo\" solo está disponible cuando el total es $0 -- si hay costo, el cliente debe aprobarlo."
                                                                : "\"Enviar cotización\" pide aprobación al cliente. \"Finalizar directo\" cierra la orden sin pasar por el cliente (solo si el cliente ya estuvo presente y no hay costo por aprobar)."}
                                                        </small>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {ordenParaFoto && (
                <ModalAgregarFotoOrden
                    orden={ordenParaFoto}
                    onClose={() => setOrdenParaFoto(null)}
                    onSuccess={() => {}}
                />
            )}

            {ordenParaFinalizar && (
                <ConfirmModal
                    title="¿Finalizar esta orden?"
                    message="Se cerrará directamente, sin enviar cotización al cliente."
                    confirmLabel="Sí, finalizar"
                    icon="fa-solid fa-check"
                    onConfirm={confirmarFinalizar}
                    onCancel={() => setOrdenParaFinalizar(null)}
                />
            )}

            {ordenParaFinalizarDirecto && (
                <ConfirmModal
                    title="¿Finalizar directo, sin pasar por el cliente?"
                    message="Esta orden se cerrará de inmediato SIN enviarle ninguna cotización al cliente para su aprobación. Úsalo solo si el cliente estuvo presente durante la reparación y ya acordaron el costo directamente contigo (en efectivo, transferencia, etc.), fuera del sistema. Si tienes dudas, cancela y usa 'Enviar cotización' en su lugar."
                    confirmLabel="Sí, finalizar directo"
                    icon="fa-solid fa-triangle-exclamation"
                    onConfirm={confirmarFinalizarDirecto}
                    onCancel={() => setOrdenParaFinalizarDirecto(null)}
                />
            )}

            {ordenParaCancelar && (
                <ConfirmModal
                    title="¿Cancelar esta orden?"
                    message="Los insumos ya agregados volverán al stock."
                    confirmLabel="Sí, cancelar"
                    icon="fa-solid fa-ban"
                    onConfirm={confirmarCancelar}
                    onCancel={() => setOrdenParaCancelar(null)}
                />
            )}
        </>
    );
}

export default OrdenesTable;