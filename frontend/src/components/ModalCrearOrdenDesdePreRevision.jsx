import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalCrearOrdenDesdePreRevision({ preRevision, onClose, onSuccess }) {
    const { mostrarToast } = useToast();

    const [tecnicos, setTecnicos] = useState([]);
    const [idTecnicoAsignado, setIdTecnicoAsignado] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        axios.get("/api/ordenes_de_servicio/tecnicos-disponibles")
            .then(res => setTecnicos(res.data))
            .catch(() => mostrarToast("No se pudo cargar la lista de técnicos disponibles.", "error"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCrear = async () => {
        if (!idTecnicoAsignado || !fechaEntrega) {
            mostrarToast("Todos los campos son obligatorios.", "warning");
            return;
        }

        setGuardando(true);
        try {
            const res = await axios.post("/api/ordenes_de_servicio/crear", {
                id_pre_revision: preRevision.id_pre_revision,
                id_tecnico_asignado: idTecnicoAsignado,
                fecha_finalizacion_estimada: fechaEntrega
            });
            mostrarToast(`${res.data.message} (${res.data.codigo_orden})`, "success");
            onSuccess();
            onClose();
        } catch (error) {
            const mensaje = error.response?.data?.message;
            mostrarToast(mensaje || "Hubo un error al crear la orden.", "error");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-briefcase"></i>
                        </div>
                        <h5 className="rs-modal-title">Crear Orden de Servicio</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        Cliente, motocicleta, tipo de servicio y observaciones se copian automáticamente
                        de la pre-revisión #{preRevision.id_pre_revision}.
                    </p>

                    <div className="rs-field">
                        <label className="rs-label">Técnico asignado <span className="rs-required">*</span></label>
                        <select className="rs-input-white" value={idTecnicoAsignado} onChange={e => setIdTecnicoAsignado(e.target.value)}>
                            <option value="">Seleccione un técnico disponible</option>
                            {tecnicos.map(t => (
                                <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
                            ))}
                        </select>
                        {tecnicos.length === 0 && (
                            <span className="rs-hint">No hay técnicos disponibles actualmente.</span>
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Fecha de entrega estimada <span className="rs-required">*</span></label>
                        <input
                            type="date"
                            className="rs-input-white"
                            value={fechaEntrega}
                            onChange={e => setFechaEntrega(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                        <span className="rs-hint">Puede ser hoy mismo o cualquier día posterior.</span>
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="rs-btn rs-btn-primary" onClick={handleCrear} disabled={guardando}>
                        {guardando ? "Creando..." : "Crear Orden"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalCrearOrdenDesdePreRevision;