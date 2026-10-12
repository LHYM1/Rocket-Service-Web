import { useEffect, useState, useCallback } from "react";
import { urlFoto } from "../../utils/urlFoto";
import axios from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/ConfirmModal";
import Lightbox from "../../components/Lightbox";

const estiloTipo = {
    "Daño": { bg: "rgba(255, 68, 68, 0.1)", color: "#b91c1c", icon: "fa-triangle-exclamation" },
    "Reparación": { bg: "rgba(34, 197, 94, 0.12)", color: "#15803d", icon: "fa-screwdriver-wrench" }
};

function ImgDanos() {
    const { esAdmin } = useAuth();
    const { mostrarToast } = useToast();
    const [imgDanos, setImgDanos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [pagina, setPagina] = useState(1);
    const [paraEliminar, setParaEliminar] = useState(null);
    const [lightboxIndice, setLightboxIndice] = useState(null);
    const porPagina = 8;

    const getImgDanos = useCallback(() => {
        axios.get("/api/imagenes_danos/listar")
            .then(res => setImgDanos(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => { getImgDanos(); }, [getImgDanos]);

    const confirmarEliminar = () => {
        axios.delete(`/api/imagenes_danos/eliminar/${paraEliminar}`)
            .then(() => {
                mostrarToast("Imagen eliminada correctamente.", "success");
                setParaEliminar(null);
                getImgDanos();
            })
            .catch(err => mostrarToast(err.response?.data?.message || "No se pudo eliminar.", "error"));
    };

    const filtradas = imgDanos.filter(img => {
        const coincideTexto =
            String(img.codigo_orden || "").toLowerCase().includes(busqueda.toLowerCase()) ||
            String(img.descripcion || "").toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = !filtroTipo || (img.tipo || "Daño") === filtroTipo;
        return coincideTexto && coincideTipo;
    });

    const inicio = (pagina - 1) * porPagina;
    const paginadas = filtradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(filtradas.length / porPagina);

    return (
        <div className="rs-page-light">
            <style>{`
                @keyframes entradaFoto {
                    from { opacity: 0; transform: translateY(16px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .rs-foto-card { animation: entradaFoto 0.35s ease both; }
                .rs-foto-card:nth-child(1) { animation-delay: 0s; }
                .rs-foto-card:nth-child(2) { animation-delay: 0.05s; }
                .rs-foto-card:nth-child(3) { animation-delay: 0.10s; }
                .rs-foto-card:nth-child(4) { animation-delay: 0.15s; }
                .rs-foto-card:nth-child(5) { animation-delay: 0.20s; }
                .rs-foto-card:nth-child(6) { animation-delay: 0.25s; }
                .rs-foto-card:nth-child(7) { animation-delay: 0.30s; }
                .rs-foto-card:nth-child(8) { animation-delay: 0.35s; }

                .rs-foto-card {
                    background: #ffffff;
                    border-radius: 14px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .rs-foto-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .rs-foto-img-wrap {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 4 / 3;
                    overflow: hidden;
                    background: #f3f4f6;
                }
                .rs-foto-img-wrap img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                .rs-foto-card:hover .rs-foto-img-wrap img {
                    transform: scale(1.06);
                }
                .rs-foto-tipo-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                }
                .rs-foto-delete {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.55);
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .rs-foto-delete:hover {
                    background: #dc3545;
                }
            `}</style>

            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fa-solid fa-camera"></i>
                        Imágenes de daños y reparaciones
                    </h2>
                    <p className="rs-page-subtitle">
                        {imgDanos.length} fotos registradas — {esAdmin ? "de todos los técnicos" : "de tus órdenes"}
                    </p>
                </div>
            </div>

            <div className="rs-filters">
                <div className="rs-search-wrapper">
                    <i className="fa-solid fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por orden o descripción..."
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
                    />
                </div>
                <select className="rs-select" value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}>
                    <option value="">Todos los tipos</option>
                    <option value="Daño">Solo daños</option>
                    <option value="Reparación">Solo reparaciones</option>
                </select>
            </div>

            {paginadas.length === 0 ? (
                <div className="rs-empty">
                    <i className="fa-solid fa-camera rs-empty-icon"></i>
                    <p className="rs-empty-text">
                        {imgDanos.length === 0
                            ? "Las fotos que agregues desde una orden aparecerán aquí."
                            : "No hay fotos que coincidan con tu búsqueda."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                    {paginadas.map((img, i) => {
                        const tipo = img.tipo || "Daño";
                        const estilo = estiloTipo[tipo];
                        return (
                            <div key={img.id_imagen} className="rs-foto-card">
                                <div className="rs-foto-img-wrap" onClick={() => setLightboxIndice(i)} style={{ cursor: "zoom-in" }}>
                                    <img src={urlFoto(img.url_imagen)} alt={img.descripcion || tipo} />
                                    <span className="rs-foto-tipo-badge" style={{ backgroundColor: estilo.bg, color: estilo.color }}>
                                        <i className={`fa-solid ${estilo.icon} me-1`}></i>{tipo}
                                    </span>
                                    <button className="rs-foto-delete" onClick={(e) => { e.stopPropagation(); setParaEliminar(img.id_imagen); }} title="Eliminar">
                                        <i className="fa-solid fa-trash" style={{ fontSize: "0.75rem" }}></i>
                                    </button>
                                </div>
                                <div style={{ padding: "12px 14px" }}>
                                    <span className="rs-id-badge">
                                        {img.codigo_orden || `ORD-${String(img.id_orden).padStart(3, "0")}`}
                                    </span>
                                    <p style={{ fontSize: "13px", color: "#374151", margin: "8px 0 4px", minHeight: "18px" }}>
                                        {img.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}
                                    </p>
                                    {esAdmin && (
                                        <div style={{ fontSize: "11px", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: "6px", marginTop: "4px" }}>
                                            <div><i className="fa-solid fa-user me-1"></i>{img.nombre_cliente || "—"}</div>
                                            <div><i className="fa-solid fa-helmet-safety me-1"></i>{img.nombre_tecnico || "—"}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPaginas > 1 && (
                <div className="rs-pagination">
                    <button className="rs-page-btn" onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button key={i} className={`rs-page-btn ${pagina === i + 1 ? "active" : ""}`} onClick={() => setPagina(i + 1)}>
                            {i + 1}
                        </button>
                    ))}
                    <button className="rs-page-btn" onClick={() => setPagina(pagina + 1)} disabled={pagina === totalPaginas}>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {paraEliminar && (
                <ConfirmModal
                    title="¿Eliminar esta imagen?"
                    message="Esta acción no se puede deshacer."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setParaEliminar(null)}
                />
            )}

            {lightboxIndice !== null && (
                <Lightbox
                    imagenes={paginadas.map(img => ({
                        url: urlFoto(img.url_imagen),
                        descripcion: img.descripcion
                    }))}
                    indiceInicial={lightboxIndice}
                    onClose={() => setLightboxIndice(null)}
                />
            )}
        </div>
    );
}

export default ImgDanos;