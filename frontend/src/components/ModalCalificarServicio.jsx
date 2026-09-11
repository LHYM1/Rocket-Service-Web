import { useState } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalCalificarServicio({ orden, onClose, onSuccess }) {
    const { mostrarToast } = useToast();
    const [calificacion, setCalificacion] = useState(0);
    const [hover, setHover] = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleEnviar = async () => {
        if (calificacion < 1) {
            mostrarToast("Selecciona una calificación de 1 a 5 estrellas.", "warning");
            return;
        }
        if (comentario.length > 300) {
            mostrarToast("El comentario no puede superar los 300 caracteres.", "warning");
            return;
        }

        setEnviando(true);
        try {
            const res = await axios.post(
                `/api/calificaciones/calificar/${orden.id_orden}`,
                { calificacion, comentario }
            );
            mostrarToast(res.data.message, "success");
            onSuccess();
            onClose();
        } catch (error) {
            mostrarToast(error.response?.data?.message || "Hubo un error al enviar tu calificación.", "error");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-star"></i>
                        </div>
                        <h5 className="rs-modal-title">Califica el servicio</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        ¿Cómo estuvo el servicio de <strong>{orden.nombre_tecnico}</strong> en tu orden {orden.codigo_orden}?
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "16px 0" }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <i
                                key={n}
                                className={`fa-star ${n <= (hover || calificacion) ? "fa-solid" : "fa-regular"}`}
                                style={{ fontSize: "32px", color: "#ff8c00", cursor: "pointer" }}
                                onMouseEnter={() => setHover(n)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setCalificacion(n)}
                            ></i>
                        ))}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Comentario (opcional)</label>
                        <textarea
                            className="rs-input-white"
                            rows={3}
                            maxLength={300}
                            value={comentario}
                            onChange={e => setComentario(e.target.value)}
                            placeholder="Cuéntanos tu experiencia..."
                        />
                        <span className="rs-hint">{comentario.length}/300</span>
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Ahora no</button>
                    <button className="rs-btn rs-btn-primary" onClick={handleEnviar} disabled={enviando}>
                        {enviando ? "Enviando..." : "Enviar calificación"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalCalificarServicio;