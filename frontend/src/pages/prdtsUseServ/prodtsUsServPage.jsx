import { useEffect, useState, useCallback } from "react";
import axios from "../../axiosConfig";
import ModalEdtAgrPrUser from "../../components/prodtsUseServ/ModalEdtAgrPrUSer";
import TablePrUSer from "../../components/prodtsUseServ/TablePrUSer";
import { useAuth } from "../../context/AuthContext";

// ─── Vista del técnico: cards agrupadas por orden ───────────────────────────
function CardInsumosTecnico({ insUsaServ }) {
    const [visible, setVisible] = useState({});

    // Agrupar insumos por id_orden
    const porOrden = insUsaServ.reduce((acc, item) => {
        const key = item.id_orden;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const ordenes = Object.entries(porOrden);

    if (ordenes.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fa-solid fa-boxes-stacked"
                    style={{ fontSize: "4rem", color: "#ff8c0030" }}></i>
                <h5 className="mt-3 fw-bold text-muted">Sin insumos registrados</h5>
                <p className="text-muted">Los insumos que uses en tus revisiones aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes entradaCard {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .insumo-card {
                    animation: entradaCard 0.35s ease both;
                }
                .insumo-card:nth-child(1) { animation-delay: 0s; }
                .insumo-card:nth-child(2) { animation-delay: 0.07s; }
                .insumo-card:nth-child(3) { animation-delay: 0.14s; }
                .insumo-card:nth-child(4) { animation-delay: 0.21s; }
                .insumo-card:nth-child(5) { animation-delay: 0.28s; }

                .chip-insumo {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,140,0,0.12);
                    border: 1px solid rgba(255,140,0,0.3);
                    color: #ff8c00;
                    border-radius: 20px;
                    padding: 4px 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .chip-insumo:hover {
                    background: rgba(255,140,0,0.22);
                }
                .chip-cantidad {
                    background: #ff8c00;
                    color: white;
                    border-radius: 12px;
                    padding: 1px 8px;
                    font-size: 0.72rem;
                    font-weight: 700;
                }

                .orden-card {
                    background: white;
                    border-radius: 14px;
                    border: 1px solid #eee;
                    overflow: hidden;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                .orden-card:hover {
                    box-shadow: 0 6px 24px rgba(0,0,0,0.11);
                    transform: translateY(-2px);
                }

                .orden-header {
                    background: #1a1a2e;
                    padding: 14px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .toggle-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    color: white;
                    padding: 4px 12px;
                    font-size: 0.78rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .toggle-btn:hover { background: rgba(255,255,255,0.2); }

                .insumos-panel {
                    overflow: hidden;
                    transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1),
                                opacity 0.3s ease,
                                padding 0.3s ease;
                }
                .insumos-panel.abierto {
                    max-height: 500px;
                    opacity: 1;
                    padding: 16px 20px;
                }
                .insumos-panel.cerrado {
                    max-height: 0;
                    opacity: 0;
                    padding: 0 20px;
                }
            `}</style>

            <div className="d-flex flex-column gap-3">
                {ordenes.map(([idOrden, insumos], idx) => {
                    const abierto = visible[idOrden] !== false; // abierto por defecto
                    const codigo = `ORD-${String(idOrden).padStart(3, "0")}`;
                    const total = insumos.reduce((s, i) => s + Number(i.cantidad), 0);

                    return (
                        <div key={idOrden}
                            className="insumo-card orden-card"
                            style={{ animationDelay: `${idx * 0.07}s` }}>

                            {/* Header oscuro */}
                            <div className="orden-header">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{
                                        width: 38, height: 38, borderRadius: "50%",
                                        background: "rgba(255,140,0,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        <i className="fa-solid fa-screwdriver-wrench"
                                            style={{ color: "#ff8c00" }}></i>
                                    </div>
                                    <div>
                                        <span className="fw-bold text-white fs-6">{codigo}</span>
                                        <small className="d-block text-white-50" style={{ fontSize: "0.72rem" }}>
                                            {insumos.length} insumo{insumos.length !== 1 ? "s" : ""} · {total} unidades totales
                                        </small>
                                    </div>
                                </div>
                                <button
                                    className="toggle-btn"
                                    onClick={() => setVisible(v => ({ ...v, [idOrden]: !abierto }))}>
                                    <i className={`fa-solid fa-chevron-${abierto ? "up" : "down"} me-1`}
                                        style={{ fontSize: "0.7rem" }}></i>
                                    {abierto ? "Ocultar" : "Ver insumos"}
                                </button>
                            </div>

                            {/* Panel de chips */}
                            <div className={`insumos-panel ${abierto ? "abierto" : "cerrado"}`}>
                                <div className="d-flex flex-wrap gap-2">
                                    {insumos.map(ins => (
                                        <span key={ins.id_insumos_orden} className="chip-insumo">
                                            <i className="fa-solid fa-box" style={{ fontSize: "0.72rem" }}></i>
                                            {ins.nombre_insumo || `Insumo #${ins.id_insumo}`}
                                            <span className="chip-cantidad">
                                                {ins.cantidad} {ins.nombre_unidad || "u."}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────
function PrUsServPage() {
    const { esAdmin } = useAuth();
    const [insUsaServ, setInsUsaServ] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const getInsUsServ = useCallback(() => {
        const url = esAdmin
            ? "/api/insumos_usados_en_servicio/listar"
            : "/api/insumos_usados_en_servicio/mis-insumos";

        axios.get(url)
            .then(res => setInsUsaServ(res.data))
            .catch(err => console.error(err));
    }, [esAdmin]);

    useEffect(() => { getInsUsServ(); }, [getInsUsServ]);

    // ── Admin: filtra por id/nombre de insumo, número de orden (CA-003) o técnico (CA-004)
    const insSerFiltrados = insUsaServ.filter(ts => {
        const texto = busqueda.toLowerCase();
        return (
            String(ts.id_insumos_orden || "").includes(texto) ||
            String(ts.nombre_insumo || "").toLowerCase().includes(texto) ||
            String(ts.codigo_orden || "").toLowerCase().includes(texto) ||
            String(ts.tecnico_nombre || "").toLowerCase().includes(texto)
        );
    });

    const inicio = (pagina - 1) * porPagina;
    const paginados = insSerFiltrados.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(insSerFiltrados.length / porPagina);

    return (
        <div className="container mt-4">

            {/* ── Título diferenciado por rol ── */}
            {esAdmin ? (
                <>
                    <h2 className="fw-bold mb-1">Insumos usados en servicio</h2>
                    <p className="text-muted mb-3">Gestión completa de insumos por orden</p>
                </>
            ) : (
                <div className="mb-4">
                    <h2 className="fw-bold mb-1">
                        <i className="fa-solid fa-boxes-stacked me-2" style={{ color: "#ff8c00" }}></i>
                        Mis insumos usados
                    </h2>
                    <p className="text-muted">Insumos que registraste en tus revisiones</p>
                </div>
            )}

            {/* ── Barra de acciones (solo admin) ── */}
            {esAdmin && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button className="btn btn-primary"
                        onClick={() => { setIdSeleccionado(null); setShowModal(true); }}>
                        <i className="fa-solid fa-plus me-1"></i>Agregar
                    </button>
                    <input
                        type="text"
                        className="form-control w-50"
                        placeholder="Buscar por insumo, N° orden o técnico..."
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
                    />
                </div>
            )}

            {/* ── Vista técnico: cards ── */}
            {!esAdmin && (
                <CardInsumosTecnico insUsaServ={insUsaServ} />
            )}

            {/* ── Vista admin: tabla ── */}
            {esAdmin && (
                <>
                    <TablePrUSer
                        insUsaServ={paginados}
                        setIdSeleccionado={ts => { setIdSeleccionado(ts); setShowModal(true); }}
                        esAdmin={esAdmin}
                        getInsUsServ={getInsUsServ}
                    />

                    {/* Paginador */}
                    <div className="d-flex justify-content-center mt-3">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setPagina(pagina - 1)}>
                                        Anterior
                                    </button>
                                </li>
                                {Array.from({ length: totalPaginas }, (_, i) => (
                                    <li key={i} className={`page-item ${pagina === i + 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setPagina(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${pagina === totalPaginas ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setPagina(pagina + 1)}>
                                        Siguiente
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </>
            )}

            {/* Modal editar/agregar (solo admin) */}
            {showModal && esAdmin && (
                <ModalEdtAgrPrUser
                    idSeleccionado={idSeleccionado}
                    getInsUsServ={getInsUsServ}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => getInsUsServ()}
                />
            )}
        </div>
    );
}

export default PrUsServPage;