import { useState } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalRechazarCotizacion({ orden, onClose, onSuccess }) {
    const { mostrarToast } = useToast();
    const [tipoRechazo, setTipoRechazo] = useState("");
    const [motivo, setMotivo] = useState("");
    const [enviando, setEnviando] = useState(false);

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
            mostrarToast(res.data.message, "success");
            onSuccess();
            onClose();
        } catch (error) {
            mostrarToast(error.response?.data?.message || "Hubo un error al procesar el rechazo.", "error");
        } finally {
            setEnviando(false);
        }
    };

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