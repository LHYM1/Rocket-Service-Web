import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalCompletarPreRevision({ preRevision, onClose, onSuccess }) {
    const { mostrarToast } = useToast();

    const [observaciones, setObservaciones] = useState("");
    const [idTipoServicio, setIdTipoServicio] = useState("");
    const [resultado, setResultado] = useState("");
    const [tiposServicio, setTiposServicio] = useState([]);
    const [archivosNuevos, setArchivosNuevos] = useState([]); // { file, previewUrl }
    const [fotosSubidas, setFotosSubidas] = useState([]); // urls ya confirmadas en el servidor
    const [guardando, setGuardando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:4000/api/tipo_servicio/listar")
            .then(res => setTiposServicio(res.data))
            .catch(() => mostrarToast("No se pudo cargar la lista de tipos de servicio.", "error"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSeleccionarArchivos = (e) => {
        const archivos = Array.from(e.target.files);
        const nuevas = archivos.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
        setArchivosNuevos(prev => [...prev, ...nuevas]);
        e.target.value = "";
    };

    const quitarArchivoNuevo = (idx) => {
        URL.revokeObjectURL(archivosNuevos[idx].previewUrl);
        setArchivosNuevos(prev => prev.filter((_, i) => i !== idx));
    };

    const subirFotosPendientes = async () => {
        if (archivosNuevos.length === 0) return [];
        setSubiendo(true);
        const nuevasUrls = [];
        try {
            for (const a of archivosNuevos) {
                const formData = new FormData();
                formData.append("foto", a.file);
                const res = await axios.post(
                    `http://localhost:4000/api/pre_revision/${preRevision.id_pre_revision}/fotos`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                nuevasUrls.push(res.data.url_imagen);
            }
            setFotosSubidas(prev => [...prev, ...nuevasUrls]);
            archivosNuevos.forEach(a => URL.revokeObjectURL(a.previewUrl));
            setArchivosNuevos([]);
        } catch (error) {
            mostrarToast("Error al subir alguna de las fotos.", "error");
        } finally {
            setSubiendo(false);
        }
        return nuevasUrls;
    };

    const handleConfirmar = async () => {
        if (!observaciones.trim()) {
            mostrarToast("Las observaciones son obligatorias.", "warning");
            return;
        }
        if (!idTipoServicio) {
            mostrarToast("El tipo de servicio es obligatorio.", "warning");
            return;
        }
        if (!resultado) {
            mostrarToast("Debes seleccionar un resultado.", "warning");
            return;
        }

        // Si hay archivos seleccionados pero aún no subidos, los subimos primero.
        // Se cuenta con el valor recién devuelto (no con el estado, que tarda un ciclo en actualizarse).
        let totalFotos = fotosSubidas.length;
        if (archivosNuevos.length > 0) {
            const nuevas = await subirFotosPendientes();
            totalFotos += nuevas.length;
        }

        // RN-003 / CA-003
        if (totalFotos === 0) {
            mostrarToast("Debe adjuntar al menos una foto antes de confirmar el resultado.", "warning");
            return;
        }

        setGuardando(true);
        try {
            const res = await axios.patch(
                `http://localhost:4000/api/pre_revision/completar/${preRevision.id_pre_revision}`,
                { observaciones, id_tipo_servicio: idTipoServicio, resultado }
            );

            mostrarToast(res.data.message, "success");
            onSuccess();
            onClose();
        } catch (error) {
            const mensaje = error.response?.data?.message;
            mostrarToast(mensaje || "Hubo un error al completar la pre-revisión.", "error");
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
                            <i className="fa-solid fa-clipboard-check"></i>
                        </div>
                        <h5 className="rs-modal-title">Completar Pre-revisión</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-field">
                        <label className="rs-label">Observaciones <span className="rs-required">*</span></label>
                        <textarea
                            className="rs-input-white"
                            rows={3}
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Describe lo que encontraste en la motocicleta..."
                        />
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Tipo de servicio <span className="rs-required">*</span></label>
                        <select className="rs-input-white" value={idTipoServicio} onChange={e => setIdTipoServicio(e.target.value)}>
                            <option value="">Seleccione un tipo de servicio</option>
                            {tiposServicio.map(ts => (
                                <option key={ts.id_tipo_servicio} value={ts.id_tipo_servicio}>{ts.nombre_servicio}</option>
                            ))}
                        </select>
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">
                            Fotos <span className="rs-required">*</span>
                            <span className="rs-hint"> (mínimo 1)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="rs-input-white"
                            onChange={onSeleccionarArchivos}
                        />

                        {archivosNuevos.length > 0 && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                                {archivosNuevos.map((a, i) => (
                                    <div key={i} style={{ position: "relative" }}>
                                        <img src={a.previewUrl} alt="preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                                        <button
                                            type="button"
                                            onClick={() => quitarArchivoNuevo(i)}
                                            style={{ position: "absolute", top: -6, right: -6, background: "#dc3545", color: "white", borderRadius: "50%", width: 20, height: 20, border: "none", fontSize: "11px", cursor: "pointer" }}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {subiendo && <span className="rs-hint">Subiendo fotos...</span>}

                        {fotosSubidas.length > 0 && (
                            <span className="rs-hint">{fotosSubidas.length} foto(s) ya guardada(s) en esta pre-revisión.</span>
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Resultado <span className="rs-required">*</span></label>
                        <div style={{ display: "flex", gap: "16px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                                <input
                                    type="radio"
                                    name="resultado"
                                    value="Requiere reparación"
                                    checked={resultado === "Requiere reparación"}
                                    onChange={e => setResultado(e.target.value)}
                                />
                                Requiere reparación
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                                <input
                                    type="radio"
                                    name="resultado"
                                    value="No requiere reparación"
                                    checked={resultado === "No requiere reparación"}
                                    onChange={e => setResultado(e.target.value)}
                                />
                                No requiere reparación
                            </label>
                        </div>
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="rs-btn rs-btn-primary" onClick={handleConfirmar} disabled={guardando || subiendo}>
                        {guardando || subiendo ? "Guardando..." : "Confirmar resultado"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalCompletarPreRevision;