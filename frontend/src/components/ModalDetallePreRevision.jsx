import { useState, useEffect } from "react";
import { urlFoto } from "../utils/urlFoto";
import axios from "../axiosConfig";

function ModalDetallePreRevision({ preRevision, onClose }) {
    const [detalle, setDetalle] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        axios.get(`/api/pre_revision/consultar/${preRevision.id_pre_revision}`)
            .then(res => setDetalle(res.data))
            .catch(() => {})
            .finally(() => setCargando(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-eye"></i>
                        </div>
                        <h5 className="rs-modal-title">Detalle de la Pre-revisión</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    {cargando ? (
                        <p className="text-muted">Cargando...</p>
                    ) : !detalle ? (
                        <p className="text-muted">No se pudo cargar el detalle.</p>
                    ) : (
                        <>
                            <div className="rs-field">
                                <label className="rs-label">Resultado</label>
                                <span style={{ fontSize: "14px" }}>{detalle.resultado || "Pendiente"}</span>
                            </div>

                            <div className="rs-field">
                                <label className="rs-label">Observaciones</label>
                                <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
                                    {detalle.observaciones || "Sin observaciones registradas."}
                                </p>
                            </div>

                            <div className="rs-field">
                                <label className="rs-label">Fotos</label>
                                {detalle.fotos && detalle.fotos.length > 0 ? (
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {detalle.fotos.map(foto => (
                                            <img
                                                key={foto.id_foto}
                                                src={urlFoto(foto.url_imagen)}
                                                alt="pre-revisión"
                                                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <span className="rs-hint">Sin fotos adjuntas.</span>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default ModalDetallePreRevision;