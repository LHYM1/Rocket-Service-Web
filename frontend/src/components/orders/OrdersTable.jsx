import axios from '../../axiosConfig';
import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

const coloresBadge = {
    "ASIGNADA": "bg-primary",
    "PENDIENTE": "bg-warning text-dark",
    "FINALIZADA": "bg-success",
    "CANCELADA": "bg-secondary",
    "EN PROCESO": "bg-info text-dark",
    "EN ESPERA": "bg-warning text-dark",
    "RECHAZADA": "bg-danger",
    "EN REVISION": "bg-info text-dark",
    "APROBADA": "bg-success",
    "FACTURADA": "bg-dark"
};

function OrdenesTable({ ordenes, setIdSeleccionado, getOrdenes, esAdmin }) {

    const [datosRevision, setDatosRevision] = useState({
        id_tipo_servicio: "",
        descripcion_del_problema: "",
        fecha_finalizacion_estimada: ""
    });

    const [insumosRevision, setInsumosRevision] = useState([]);
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [tiposServicio, setTiposServicio] = useState([]);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState("");
    const [cantidadInsumo, setCantidadInsumo] = useState(1);

    // Panel de revisión: qué orden está abierta y si está animando el cierre
    const [ordenEnRevision, setOrdenEnRevision] = useState(null);
    const [panelAbierto, setPanelAbierto]     = useState(false); // controla la clase CSS

    const { mostrarToast } = useToast();
    const mostrarNotificacion = (mensaje, tipo = "success") => mostrarToast(mensaje, tipo);

    useEffect(() => {
        axios.get("http://localhost:4000/api/insumos/listar")
            .then(res => setInsumosDisponibles(res.data))
            .catch(err => console.error(err));
        axios.get("http://localhost:4000/api/tipo_servicio/listar")
            .then(res => setTiposServicio(res.data))
            .catch(err => console.error(err));
    }, []);

    // ── Abrir / cerrar panel con animación ───────────────────────────────────
    const abrirPanel = (idOrden) => {
        setOrdenEnRevision(idOrden);
        // pequeño delay para que el DOM monte el elemento antes de aplicar la clase
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setPanelAbierto(true));
        });
    };

    const cerrarPanel = () => {
        setPanelAbierto(false); // dispara transición de cierre
        // esperar a que terminen los 380ms de transition antes de desmontar
        setTimeout(() => {
            setOrdenEnRevision(null);
            setDatosRevision({ id_tipo_servicio: "", descripcion_del_problema: "", fecha_finalizacion_estimada: "" });
            setInsumosRevision([]);
        }, 380);
    };

    // ─────────────────────────────────────────────────────────────────────────

    const agregarInsumo = () => {
        if (!insumoSeleccionado || cantidadInsumo < 1) return;
        const insumo = insumosDisponibles.find(i => i.id_insumo === parseInt(insumoSeleccionado));
        if (!insumo) return;
        if (insumosRevision.find(i => i.id_insumo === parseInt(insumoSeleccionado))) {
            mostrarNotificacion("Este insumo ya fue agregado", "warning");
            return;
        }
        setInsumosRevision([...insumosRevision, {
            id_insumo: parseInt(insumoSeleccionado),
            nombre_insumo: insumo.nombre_insumo,
            cantidad: cantidadInsumo,
            nombre_unidad: insumo.nombre_unidad
        }]);
        setInsumoSeleccionado("");
        setCantidadInsumo(1);
    };

    const quitarInsumo = (idInsumo) => {
        setInsumosRevision(insumosRevision.filter(i => i.id_insumo !== idInsumo));
    };

    const terminarRevision = async (idOrden) => {
        try {
            await axios.put(
                `http://localhost:4000/api/ordenes_de_servicio/terminar-revision/${idOrden}`,
                {
                    id_tipo_servicio: datosRevision.id_tipo_servicio,
                    descripcion_del_problema: datosRevision.descripcion_del_problema,
                    fecha_finalizacion_estimada: datosRevision.fecha_finalizacion_estimada
                }
            );
            await axios.put(
                `http://localhost:4000/api/ordenes_de_servicio/actualizar-estado/${idOrden}`,
                { id_estado_de_servicio: 16 }
            );
            for (const insumo of insumosRevision) {
                await axios.post("http://localhost:4000/api/insumos_usados_en_servicio/crear", {
                    id_orden: idOrden,
                    id_insumo: insumo.id_insumo,
                    cantidad: insumo.cantidad
                });
            }
            mostrarNotificacion("¡Revisión completada! Esperando repuestos.", "success");
            cerrarPanel();
            await getOrdenes();
        } catch (err) {
            console.error(err);
            mostrarNotificacion("Error al terminar la revisión", "error");
        }
    };

    const revisionCompleta =
        datosRevision.id_tipo_servicio &&
        datosRevision.descripcion_del_problema &&
        datosRevision.fecha_finalizacion_estimada &&
        insumosRevision.length > 0;

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

    const eliminarOrden = (id, estado) => {
        if (estado !== "FINALIZADA" && estado !== "CANCELADA") {
            mostrarNotificacion("Solo se pueden eliminar órdenes finalizadas.", "error");
            return;
        }
        if (window.confirm(`¿Estás seguro de eliminar la orden #${id}?`)) {
            axios.delete(`http://localhost:4000/api/ordenes_de_servicio/eliminar/${id}`)
                .then(() => { alert("Orden eliminada con éxito"); getOrdenes(); })
                .catch(err => { console.error(err); alert("No se pudo eliminar la orden."); });
        }
    };
    
    const realizarOrden = async (idOrden, estadoActual) => {
        try {
            const userId = localStorage.getItem("userId");
            if (estadoActual === "EN PROCESO") {
                await axios.put(`http://localhost:4000/api/ordenes_de_servicio/actualizar-estado/${idOrden}`, { id_estado_de_servicio: 3 });
                await axios.put(`http://localhost:4000/api/registro_actividad/actualizar-disponibilidad/${userId}`, { estado_disponibilidad: "Disponible" });
                window.dispatchEvent(new CustomEvent('disponibilidadCambiada', { detail: { estado: "Disponible" } }));
                mostrarNotificacion("¡Orden finalizada! Tu disponibilidad cambió a Disponible.");
            } else if (estadoActual === "EN ESPERA" || estadoActual === "TÉCNICO EN RECESO") {
                await axios.put(`http://localhost:4000/api/ordenes_de_servicio/actualizar-estado/${idOrden}`, { id_estado_de_servicio: 5 });
                await axios.put(`http://localhost:4000/api/registro_actividad/actualizar-disponibilidad/${userId}`, { estado_disponibilidad: "Realizando servicio" });
                window.dispatchEvent(new CustomEvent('disponibilidadCambiada', { detail: { estado: "Realizando servicio" } }));
                mostrarNotificacion("¡De vuelta a la orden!");
            } else if (estadoActual === "ESPERANDO REPUESTOS") {
                // Validar que tenga al menos 1 imagen antes de empezar
                const { data } = await axios.get(
                    `http://localhost:4000/api/imagenes_danos/validar/${idOrden}`
                );
                if (!data.tiene_imagenes) {
                    mostrarNotificacion("⚠ Debes adjuntar al menos 1 foto en la pestaña 'Imagenes' antes de empezar el servicio.", "error");
                    return;
                }
                await axios.put(`http://localhost:4000/api/ordenes_de_servicio/actualizar-estado/${idOrden}`, { id_estado_de_servicio: 5 });
                mostrarNotificacion("¡Empezando el servicio! Orden en proceso.");
            } else {
                await axios.put(`http://localhost:4000/api/ordenes_de_servicio/actualizar-estado/${idOrden}`, { id_estado_de_servicio: 8 });
                await axios.put(`http://localhost:4000/api/registro_actividad/actualizar-disponibilidad/${userId}`, { estado_disponibilidad: "Realizando servicio" });
                window.dispatchEvent(new CustomEvent('disponibilidadCambiada', { detail: { estado: "Realizando servicio" } }));
                mostrarNotificacion("¡Orden iniciada! Ahora puedes realizar la revisión.");
            }
            getOrdenes();
        } catch (err) {
            console.error(err);
            mostrarNotificacion("Error al actualizar la orden", "error");
        }
    };

    return (
        <>
            {/* ── Estilos de animación del panel y cards ── */}
            <style>{`
                @keyframes entradaOrden {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .orden-card-animada {
                    animation: entradaOrden 0.4s ease both;
                }
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

                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }
            `}</style>

            <div className="row g-4">
                {ordenes.map((o) => (
                    <div key={`${o.id_orden}-${o.nombre_estado}`} className="col-md-6 col-lg-4 orden-card-animada">
                        <div className="card h-100 shadow border-0"
                            style={{
                                borderRadius: "14px",
                                overflow: "hidden",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                cursor: "pointer"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                            }}
                        >
                            {/* Header */}
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
                                {/* Cliente */}
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

                                {/* Moto */}
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-motorcycle" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>MOTOCICLETA</small>
                                        <span className="fw-semibold">
                                            {o.placa_moto || "No definida"}
                                            <span className="text-muted ms-1" style={{ fontSize: "0.85rem" }}>
                                                — {o.nombre_modelo || ""}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Técnico */}
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

                                {/* Servicio */}
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: "36px", height: "36px", backgroundColor: "#ff8c0025", minWidth: "36px" }}>
                                        <i className="fa-solid fa-wrench" style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>SERVICIO</small>
                                        <span className="fw-semibold">
                                            {["ASIGNADA", "EN ESPERA", "TÉCNICO EN RECESO"].includes(o.nombre_estado) ? (
                                                <span className="text-muted fst-italic" style={{ fontSize: "0.85rem" }}>
                                                    <i className="fa-solid fa-clock me-1"></i>Esperando revisión
                                                </span>
                                            ) : ordenEnRevision === o.id_orden && datosRevision.id_tipo_servicio ? (
                                                <span style={{ color: "#ff8c00" }}>
                                                    {tiposServicio.find(ts => ts.id_tipo_servicio === parseInt(datosRevision.id_tipo_servicio))?.nombre_servicio || "No definido"}
                                                </span>
                                            ) : o.nombre_servicio ? (
                                                o.nombre_servicio
                                            ) : (
                                                <span className="text-muted fst-italic" style={{ fontSize: "0.85rem" }}>
                                                    <i className="fa-solid fa-clock me-1"></i>Esperando revisión
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Problema */}
                                <div className="p-2 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                                    <small className="text-muted d-block mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                                        <i className="fa-solid fa-comment-dots me-1"></i>PROBLEMA
                                    </small>
                                    <span style={{ fontSize: "0.85rem" }}>
                                        {["ASIGNADA", "EN ESPERA", "TÉCNICO EN RECESO"].includes(o.nombre_estado) ? (
                                            <span className="text-muted fst-italic">
                                                <i className="fa-solid fa-clock me-1"></i>Esperando revisión del técnico
                                            </span>
                                        ) : ordenEnRevision === o.id_orden && datosRevision.descripcion_del_problema ? (
                                            <span className="fw-semibold" style={{ color: "#ff8c00" }}>
                                                {datosRevision.descripcion_del_problema}
                                            </span>
                                        ) : o.descripcion_del_problema ? (
                                            o.descripcion_del_problema
                                        ) : (
                                            <span className="text-muted fst-italic">
                                                <i className="fa-solid fa-clock me-1"></i>Esperando revisión del técnico
                                            </span>
                                        )}
                                    </span>
                                </div>
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
                                        {ordenEnRevision === o.id_orden && datosRevision.fecha_finalizacion_estimada ? (
                                            <span style={{ color: "#ff8c00", fontWeight: "bold" }}>
                                                {new Date(datosRevision.fecha_finalizacion_estimada).toLocaleDateString('es-ES', {
                                                    year: 'numeric', month: '2-digit', day: '2-digit'
                                                })}
                                            </span>
                                        ) : o.fecha_finalizacion_estimada ? (
                                            new Date(o.fecha_finalizacion_estimada).toLocaleDateString()
                                        ) : (
                                            <span className="text-muted fst-italic">No definida</span>
                                        )}
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
                                            style={{ opacity: (o.nombre_estado !== "FINALIZADA" && o.nombre_estado !== "CANCELADA") ? 0.5 : 1 }}>
                                            <i className="fa-solid fa-trash me-1"></i>Eliminar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2">

                                        {/* Botón principal */}
                                        {o.nombre_estado !== "EN REVISIÓN" && (
                                            <button
                                                onClick={() => realizarOrden(o.id_orden, o.nombre_estado)}
                                                className="btn btn-sm w-100 text-white fw-semibold"
                                                style={{
                                                    backgroundColor:
                                                        (o.nombre_estado === "EN ESPERA" || o.nombre_estado === "TÉCNICO EN RECESO") ? "#0d6efd" :
                                                        o.nombre_estado === "ESPERANDO REPUESTOS" ? "#6f42c1" :
                                                        "#ff8c00",
                                                    transition: "background-color 0.3s ease"
                                                }}
                                                disabled={o.nombre_estado === "FINALIZADA"}
                                                onMouseEnter={e => {
                                                    if (o.nombre_estado === "EN PROCESO") {
                                                        e.currentTarget.style.backgroundColor = "#28a745";
                                                        e.currentTarget.innerHTML = '<i class="fa-solid fa-check me-1"></i>Finalizar orden';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (o.nombre_estado === "EN PROCESO") {
                                                        e.currentTarget.style.backgroundColor = "#ff8c00";
                                                        e.currentTarget.innerHTML = '<i class="fa-solid fa-spinner me-1"></i>En proceso...';
                                                    }
                                                }}
                                            >
                                                <i className={`fa-solid ${
                                                    o.nombre_estado === "EN PROCESO" ? "fa-spinner" :
                                                    (o.nombre_estado === "EN ESPERA" || o.nombre_estado === "TÉCNICO EN RECESO") ? "fa-rotate-left" :
                                                    o.nombre_estado === "FINALIZADA" ? "fa-check" :
                                                    o.nombre_estado === "ESPERANDO REPUESTOS" ? "fa-boxes-stacked" :
                                                    "fa-play"} me-1`}></i>
                                                {o.nombre_estado === "EN PROCESO" ? "En proceso..." :
                                                (o.nombre_estado === "EN ESPERA" || o.nombre_estado === "TÉCNICO EN RECESO") ? "Volver a la orden" :
                                                o.nombre_estado === "FINALIZADA" ? "Orden finalizada" :
                                                o.nombre_estado === "ESPERANDO REPUESTOS" ? "Empezar servicio" :
                                                "Realizar orden"}
                                            </button>
                                        )}

                                        {/* Botón revisar moto */}
                                        {o.nombre_estado === "EN REVISIÓN" && (
                                            <button
                                                onClick={() => {
                                                    if (ordenEnRevision === o.id_orden) {
                                                        cerrarPanel();
                                                    } else {
                                                        abrirPanel(o.id_orden);
                                                    }
                                                }}
                                                className="btn btn-sm w-100 text-white fw-semibold"
                                                style={{
                                                    backgroundColor: ordenEnRevision === o.id_orden ? "#6c757d" : "#fd7e14",
                                                    transition: "background-color 0.25s ease"
                                                }}>
                                                <i className={`fa-solid ${ordenEnRevision === o.id_orden ? "fa-xmark" : "fa-magnifying-glass"} me-1`}></i>
                                                {ordenEnRevision === o.id_orden ? "Cerrar revisión" : "Revisar moto"}
                                            </button>
                                        )}

                                        {/* Panel expandible con animación suave */}
                                        {o.nombre_estado === "EN REVISIÓN" && ordenEnRevision === o.id_orden && (
                                            <div className={`panel-revision ${panelAbierto ? "panel-abierto" : "panel-cerrado"}`}>

                                                <h6 className="fw-bold mb-3" style={{ color: "#1a1a2e", fontSize: "0.9rem" }}>
                                                    <i className="fa-solid fa-clipboard-list me-2" style={{ color: "#ff8c00" }}></i>
                                                    Datos de la revisión
                                                </h6>

                                                {/* Tipo de servicio */}
                                                <div className="mb-2">
                                                    <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.8rem" }}>
                                                        <i className="fa-solid fa-wrench me-1" style={{ color: "#ff8c00" }}></i>
                                                        Tipo de Servicio <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={datosRevision.id_tipo_servicio}
                                                        onChange={e => setDatosRevision({ ...datosRevision, id_tipo_servicio: e.target.value })}>
                                                        <option value="">Seleccione el servicio</option>
                                                        {tiposServicio.map(ts => (
                                                            <option key={ts.id_tipo_servicio} value={ts.id_tipo_servicio}>
                                                                {ts.nombre_servicio}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Descripción */}
                                                <div className="mb-2">
                                                    <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.8rem" }}>
                                                        <i className="fa-solid fa-comment-dots me-1" style={{ color: "#ff8c00" }}></i>
                                                        Descripción del Problema <span className="text-danger">*</span>
                                                    </label>
                                                    <textarea
                                                        className="form-control form-control-sm"
                                                        rows="2"
                                                        placeholder="Describa el problema encontrado..."
                                                        value={datosRevision.descripcion_del_problema}
                                                        onChange={e => setDatosRevision({ ...datosRevision, descripcion_del_problema: e.target.value })}
                                                    ></textarea>
                                                </div>

                                                {/* Fecha */}
                                                <div className="mb-2">
                                                    <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.8rem" }}>
                                                        <i className="fa-regular fa-calendar me-1" style={{ color: "#ff8c00" }}></i>
                                                        Fecha Entrega Estimada <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={datosRevision.fecha_finalizacion_estimada || ""}
                                                        onChange={e => setDatosRevision({ ...datosRevision, fecha_finalizacion_estimada: e.target.value })}
                                                    />
                                                </div>

                                                {/* Insumos */}
                                                <div className="mb-2">
                                                    <label className="form-label fw-semibold mb-1" style={{ fontSize: "0.8rem" }}>
                                                        <i className="fa-solid fa-boxes-stacked me-1" style={{ color: "#ff8c00" }}></i>
                                                        Insumos <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="d-flex gap-1 mb-2 align-items-center">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={insumoSeleccionado}
                                                            onChange={e => setInsumoSeleccionado(e.target.value)}>
                                                            <option value="">Seleccione</option>
                                                            {insumosDisponibles.map(i => (
                                                                <option key={i.id_insumo} value={i.id_insumo}>
                                                                    {i.nombre_insumo}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{ width: "70px" }}
                                                                min="1"
                                                                value={cantidadInsumo}
                                                                onChange={e => setCantidadInsumo(parseInt(e.target.value))}
                                                            />
                                                            {insumoSeleccionado && (
                                                                <small className="text-muted fw-semibold" style={{ whiteSpace: "nowrap" }}>
                                                                    {insumosDisponibles.find(i => i.id_insumo === parseInt(insumoSeleccionado))?.nombre_unidad || ""}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="btn btn-sm text-white px-2"
                                                            style={{ backgroundColor: "#ff8c00" }}
                                                            onClick={agregarInsumo}>
                                                            <i className="fa-solid fa-plus"></i>
                                                        </button>
                                                    </div>

                                                    {insumosRevision.length === 0 ? (
                                                        <p className="text-muted fst-italic mb-2" style={{ fontSize: "0.78rem" }}>
                                                            Sin insumos agregados
                                                        </p>
                                                    ) : (
                                                        <div className="d-flex flex-column gap-1 mb-2">
                                                            {insumosRevision.map(insumo => (
                                                                <div key={insumo.id_insumo}
                                                                    className="d-flex align-items-center justify-content-between p-1 rounded"
                                                                    style={{ backgroundColor: "#f8f9fa", fontSize: "0.82rem" }}>
                                                                    <span className="fw-semibold">{insumo.nombre_insumo}</span>
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        <span className="badge" style={{ backgroundColor: "#ff8c00" }}>
                                                                            {insumo.cantidad} {insumo.nombre_unidad}
                                                                        </span>
                                                                        <button className="btn btn-danger btn-sm py-0 px-1"
                                                                            onClick={() => quitarInsumo(insumo.id_insumo)}>
                                                                            <i className="fa-solid fa-xmark" style={{ fontSize: "0.7rem" }}></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botón terminar revisión */}
                                                <button
                                                    className="btn text-white fw-semibold w-100 btn-sm"
                                                    style={{
                                                        backgroundColor: revisionCompleta ? "#28a745" : "#adb5bd",
                                                        cursor: revisionCompleta ? "pointer" : "not-allowed"
                                                    }}
                                                    disabled={!revisionCompleta}
                                                    onClick={() => terminarRevision(o.id_orden)}>
                                                    <i className="fa-solid fa-clipboard-check me-1"></i>
                                                    Terminar Revisión
                                                </button>

                                                {!revisionCompleta && (
                                                    <small className="text-muted d-block mt-1 text-center" style={{ fontSize: "0.72rem" }}>
                                                        Complete todos los campos y al menos un insumo
                                                    </small>
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

        </>
    );
}

// UPDATE ordenes_de_servicio SET id_estado_de_servicio = 1 WHERE id_orden = 3;
// UPDATE registro_actividad SET estado_disponibilidad = 'Disponible' WHERE id_usuario = 25;

export default OrdenesTable;