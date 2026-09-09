import { useState } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalRechazarCotizacion({ orden, onClose, onSuccess }) {
    const { mostrarToast } = useToast();
    const [tipoRechazo, setTipoRechazo] = useState("");
    const [motivo, setMotivo] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [ordenCancelada, setOrdenCancelada] = useState(false); // pantalla de cierre, solo si eligió "Cancelar"

    const handleEnviar = async () => {
        if (!tipoRechazo) {
            mostrarToast("Selecciona si quieres cancelar la orden o pedir un reajuste.", "warning");
            return;
        }
        if (!motivo.trim()) {
            mostrarToast("Debe ingresar el motivo de su rechazo.", "warning");
            return;
        }

        setEnviando(true);
        try {
            const res = await axios.patch(
                `http://localhost:4000/api/ordenes_de_servicio/rechazar/${orden.id_orden}`,
                { tipo_rechazo: tipoRechazo, motivo }
            );
            onSuccess();

            if (tipoRechazo === "Cancelar") {
                setOrdenCancelada(true);
            } else {
                mostrarToast(res.data.message, "success");
                onClose();
            }
        } catch (error) {
            mostrarToast(error.response?.data?.message || "Hubo un error al procesar el rechazo.", "error");
        } finally {
            setEnviando(false);
        }
    };

    if (ordenCancelada) {
        return (
            <div className="rs-modal-overlay">
                <div className="rs-modal" style={{ maxWidth: "400px" }}>
                    <div className="rs-modal-body" style={{ alignItems: "center", textAlign: "center", paddingTop: "36px" }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "50%",
                            backgroundColor: "rgba(220,53,69,0.1)", color: "#dc3545",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "28px", margin: "0 auto 12px"
                        }}>
                            <i className="fa-solid fa-face-sad-tear"></i>
                        </div>
                        <h5 className="rs-modal-title" style={{ fontSize: "18px" }}>Orden cancelada</h5>
                        <p style={{ color: "#6b7280", fontSize: "14px", margin: "8px 0 4px" }}>
                            Lamentamos mucho tu cancelación.
                        </p>
                        <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                            Puedes recoger tu moto en el taller. ¡Esperamos que vuelvas pronto!
                        </p>
                    </div>
                    <div className="rs-modal-footer" style={{ justifyContent: "center" }}>
                        <button className="rs-btn rs-btn-primary" onClick={onClose}>
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon rs-modal-icon-danger">
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                        <h5 className="rs-modal-title">Rechazar cotización</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-field">
                        <label className="rs-label">¿Qué quieres hacer? <span className="rs-required">*</span></label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                                <input type="radio" name="tipoRechazo" value="Cancelar"
                                    checked={tipoRechazo === "Cancelar"}
                                    onChange={e => setTipoRechazo(e.target.value)} />
                                Cancelar la orden por completo
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                                <input type="radio" name="tipoRechazo" value="Reajuste"
                                    checked={tipoRechazo === "Reajuste"}
                                    onChange={e => setTipoRechazo(e.target.value)} />
                                Pedirle al técnico que ajuste la cotización
                            </label>
                        </div>
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Motivo <span className="rs-required">*</span></label>
                        <textarea
                            className="rs-input-white"
                            rows={3}
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Cuéntanos por qué..."
                        />
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Volver</button>
                    <button className="rs-btn rs-btn-primary" onClick={handleEnviar} disabled={enviando}>
                        {enviando ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalRechazarCotizacion;