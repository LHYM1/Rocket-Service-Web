import { useState, useEffect } from "react";
import { urlFoto } from "../utils/urlFoto";
import axios from "../axiosConfig";
import Lightbox from "./Lightbox";

function ModalEvidenciasOrden({ orden, onClose }) {
    const [fotos, setFotos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pestana, setPestana] = useState("Daño");
    const [lightboxIndice, setLightboxIndice] = useState(null);

    useEffect(() => {
        axios.get(`/api/imagenes_danos/por-orden/${orden.id_orden}`)
            .then(res => setFotos(res.data))
            .catch(() => {})
            .finally(() => setCargando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fotosFiltradas = fotos.filter(f => (f.tipo || "Daño") === pestana);

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal" style={{ maxWidth: "560px" }}>
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-images"></i>
                        </div>
                        <h5 className="rs-modal-title">Evidencias — {orden.codigo_orden}</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                        <button
                            onClick={() => setPestana("Daño")}
                            style={{
                                flex: 1, padding: "10px", border: "none", background: "none",
                                borderBottom: pestana === "Daño" ? "2px solid #ff8c00" : "2px solid transparent",
                                color: pestana === "Daño" ? "#ff8c00" : "#6b7280",
                                fontWeight: pestana === "Daño" ? "700" : "500", cursor: "pointer"
                            }}>
                            <i className="fa-solid fa-triangle-exclamation me-1"></i>Daños
                        </button>
                        <button
                            onClick={() => setPestana("Reparación")}
                            style={{
                                flex: 1, padding: "10px", border: "none", background: "none",
                                borderBottom: pestana === "Reparación" ? "2px solid #ff8c00" : "2px solid transparent",
                                color: pestana === "Reparación" ? "#ff8c00" : "#6b7280",
                                fontWeight: pestana === "Reparación" ? "700" : "500", cursor: "pointer"
                            }}>
                            <i className="fa-solid fa-screwdriver-wrench me-1"></i>Reparaciones
                        </button>
                    </div>

                    <div style={{ paddingTop: "16px" }}>
                        {cargando ? (
                            <p className="text-muted">Cargando...</p>
                        ) : fotosFiltradas.length === 0 ? (
                            <p className="text-muted fst-italic text-center py-3">
                                Aún no hay fotos de {pestana === "Daño" ? "daños" : "reparaciones"} para esta orden.
                            </p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                                {fotosFiltradas.map((foto, i) => (
                                    <div
                                        key={foto.id_imagen}
                                        onClick={() => setLightboxIndice(i)}
                                        style={{ cursor: "zoom-in" }}
                                    >
                                        <img
                                            src={urlFoto(foto.url_imagen)}
                                            alt={foto.descripcion || pestana}
                                            style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", transition: "transform 0.15s" }}
                                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                        />
                                        {foto.descripcion && (
                                            <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0", textAlign: "center" }}>
                                                {foto.descripcion}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>

            {lightboxIndice !== null && (
                <Lightbox
                    imagenes={fotosFiltradas.map(f => ({
                        url: urlFoto(f.url_imagen),
                        descripcion: f.descripcion
                    }))}
                    indiceInicial={lightboxIndice}
                    onClose={() => setLightboxIndice(null)}
                />
            )}
        </div>
    );
}

export default ModalEvidenciasOrden;