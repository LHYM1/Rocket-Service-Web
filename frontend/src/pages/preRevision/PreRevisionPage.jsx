import { useState, useEffect, useCallback } from "react";
import axios from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ModalCrearPreRevision from "../../components/ModalCrearPreRevision";
import ModalCompletarPreRevision, { hayBorrador } from "../../components/ModalCompletarPreRevision";
import ModalCrearOrdenDesdePreRevision from "../../components/ModalCrearOrdenDesdePreRevision";
import ConfirmModal from "../../components/ConfirmModal";
import ModalDetallePreRevision from "../../components/ModalDetallePreRevision";
import { useNotif } from "../../context/NotifContext";

const ESTADOS_BADGE = {
    PENDIENTE: "rs-badge-warning",
    COMPLETADA: "rs-badge-orange",
    FINALIZADA: "rs-badge-success"
};

function PreRevisionPage() {
    const { esAdmin, esTecnico } = useAuth();
    const { marcarPreRevisionesVistas, marcarPendientesOrdenVistas } = useNotif();
    const { mostrarToast } = useToast();
    const [lista, setLista] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [showCrear, setShowCrear] = useState(false);
    const [seleccionada, setSeleccionada] = useState(null);
    const [idParaEliminar, setIdParaEliminar] = useState(null);
    const [paraCrearOrden, setParaCrearOrden] = useState(null);
    const [paraVerDetalle, setParaVerDetalle] = useState(null);

    const cargar = useCallback(() => {
        const url = filtroEstado
            ? `http://localhost:4000/api/pre_revision/listar?estado=${filtroEstado}`
            : `http://localhost:4000/api/pre_revision/listar`;
        axios.get(url)
            .then(res => {
                setLista(res.data);
                if (esTecnico) {
                    marcarPreRevisionesVistas(res.data.map(pr => pr.id_pre_revision));
                }
                if (esAdmin) {
                    // Marca como vistas solo las que ya están COMPLETADA + Requiere reparación
                    // (las mismas que cuenta el badge), no todas las de la tabla
                    const conOrdenPendiente = res.data.filter(pr =>
                        pr.estado === "COMPLETADA" && pr.resultado === "Requiere reparación" && !pr.id_orden_generada
                    );
                    marcarPendientesOrdenVistas(conOrdenPendiente.map(pr => pr.id_pre_revision));
                }
            })
            .catch(err => console.error(err));
    }, [filtroEstado, esTecnico, esAdmin, marcarPreRevisionesVistas, marcarPendientesOrdenVistas]);

    useEffect(() => { cargar(); }, [cargar]);

    const eliminarPreRevision = (id) => {
        setIdParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = idParaEliminar;
        setIdParaEliminar(null);
        axios.delete(`http://localhost:4000/api/pre_revision/eliminar/${id}`)
            .then(res => {
                mostrarToast(res.data.message, "success");
                cargar();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar.", "error");
            });
    };

    return (
        <div className="rs-page-light">
            <style>{`
                @keyframes entradaFilaPreRevision {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .rs-table tbody tr {
                    animation: entradaFilaPreRevision 0.35s ease both;
                }
                .rs-table tbody tr:nth-child(1) { animation-delay: 0s; }
                .rs-table tbody tr:nth-child(2) { animation-delay: 0.05s; }
                .rs-table tbody tr:nth-child(3) { animation-delay: 0.10s; }
                .rs-table tbody tr:nth-child(4) { animation-delay: 0.15s; }
                .rs-table tbody tr:nth-child(5) { animation-delay: 0.20s; }
                .rs-table tbody tr:nth-child(6) { animation-delay: 0.25s; }
                .rs-table tbody tr:nth-child(7) { animation-delay: 0.30s; }
                .rs-table tbody tr:nth-child(8) { animation-delay: 0.35s; }
            `}</style>
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fa-solid fa-magnifying-glass"></i>{" "}
                        {esAdmin ? "Pre-revisiones" : "Mis Pre-revisiones"}
                    </h2>
                    <p className="rs-page-subtitle">{lista.length} pre-revisiones</p>
                </div>
                {esAdmin && (
                    <button className="rs-btn rs-btn-primary" onClick={() => setShowCrear(true)}>
                        <i className="fa-solid fa-plus"></i>{" "}
                        Nueva Pre-revisión
                    </button>
                )}
            </div>

            {esAdmin && (
                <div className="rs-filters">
                    <select className="rs-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="COMPLETADA">Completada (lista para orden)</option>
                        <option value="FINALIZADA">Finalizada</option>
                    </select>
                </div>
            )}

            {lista.length === 0 ? (
                <div className="rs-empty">
                    <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                    <p className="rs-empty-text">No hay pre-revisiones registradas.</p>
                </div>
            ) : (
                <div className="rs-table-wrapper">
                    <table className="rs-table rs-table-sm">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Placa</th>
                                {esAdmin && <th>Técnico</th>}
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Resultado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.map(pr => (
                                <tr key={pr.id_pre_revision}>
                                    <td>{pr.cliente}</td>
                                    <td>{pr.placa}</td>
                                    {esAdmin && <td>{pr.tecnico}</td>}
                                    <td>{new Date(pr.fecha_pre_revision).toLocaleDateString('es-CO')}</td>
                                    <td>
                                        <span className={`rs-badge ${ESTADOS_BADGE[pr.estado] || "rs-badge-muted"}`}>
                                            {pr.estado}
                                        </span>
                                    </td>
                                    <td>{pr.resultado || "—"}</td>
                                    <td>
                                        <div className="rs-actions">
                                            {!esAdmin && pr.estado === "PENDIENTE" && (
                                                <button
                                                    className="rs-btn rs-btn-primary"
                                                    onClick={() => setSeleccionada(pr)}
                                                >
                                                    {hayBorrador(pr.id_pre_revision) ? (
                                                        <><i className="fa-solid fa-pen me-1"></i>Seguir editando</>
                                                    ) : "Aceptar Pre-Revisión"}
                                                </button>
                                            )}
                                            {esAdmin && pr.estado === "PENDIENTE" && (
                                                <button
                                                    className="rs-btn rs-btn-icon rs-btn-delete"
                                                    onClick={() => eliminarPreRevision(pr.id_pre_revision)}
                                                    title="Eliminar (solo pendientes)"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                            {esAdmin && pr.estado === "COMPLETADA" && !pr.id_orden_generada && (
                                                <button
                                                    className="rs-btn rs-btn-primary"
                                                    onClick={() => setParaCrearOrden(pr)}
                                                >
                                                    Crear orden
                                                </button>
                                            )}
                                            {esAdmin && pr.estado === "COMPLETADA" && pr.id_orden_generada && (
                                                <span className="rs-badge rs-badge-success">Orden creada</span>
                                            )}

                                            {/* Técnico: estado informativo + ojo para ver el detalle, cuando ya terminó */}
                                            {!esAdmin && pr.estado === "FINALIZADA" && (
                                                <span className="rs-badge rs-badge-success">Sin acción pendiente</span>
                                            )}
                                            {!esAdmin && pr.estado === "COMPLETADA" && !pr.id_orden_generada && (
                                                <span className="rs-badge rs-badge-warning">Esperando que Admin cree la orden</span>
                                            )}
                                            {!esAdmin && pr.estado === "COMPLETADA" && pr.id_orden_generada && (
                                                <span className="rs-badge rs-badge-success">Orden #{pr.id_orden_generada} creada</span>
                                            )}
                                            {!esAdmin && (pr.estado === "FINALIZADA" || pr.estado === "COMPLETADA") && (
                                                <button
                                                    className="rs-btn rs-btn-icon rs-btn-edit"
                                                    onClick={() => setParaVerDetalle(pr)}
                                                    title="Ver detalle"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCrear && (
                <ModalCrearPreRevision
                    onClose={() => setShowCrear(false)}
                    onSuccess={cargar}
                />
            )}

            {seleccionada && (
                <ModalCompletarPreRevision
                    preRevision={seleccionada}
                    onClose={() => setSeleccionada(null)}
                    onSuccess={cargar}
                />
            )}

            {idParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar esta pre-revisión?"
                    message="Solo se puede eliminar si sigue en estado PENDIENTE. Esta acción no se puede deshacer."
                    confirmLabel="Eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setIdParaEliminar(null)}
                />
            )}

            {paraCrearOrden && (
                <ModalCrearOrdenDesdePreRevision
                    preRevision={paraCrearOrden}
                    onClose={() => setParaCrearOrden(null)}
                    onSuccess={cargar}
                />
            )}

            {paraVerDetalle && (
                <ModalDetallePreRevision
                    preRevision={paraVerDetalle}
                    onClose={() => setParaVerDetalle(null)}
                />
            )}
        </div>
    );
}

export default PreRevisionPage;