import { useState } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalAgregarFotoOrden({ orden, onClose, onSuccess }) {
    const { mostrarToast } = useToast();
    const [tipo, setTipo] = useState("Daño");
    const [descripcion, setDescripcion] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [subiendo, setSubiendo] = useState(false);

    const onSeleccionar = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setArchivo(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubir = async () => {
        if (!archivo) {
            mostrarToast("Selecciona una foto primero.", "warning");
            return;
        }

        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append("url_imagen", archivo);
            formData.append("id_orden", orden.id_orden);
            formData.append("tipo", tipo);
            formData.append("descripcion", descripcion);

            await axios.post("http://localhost:4000/api/imagenes_danos/crear", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            mostrarToast("Foto agregada correctamente.", "success");
            onSuccess();
            onClose();
        } catch (error) {
            mostrarToast(error.response?.data?.message || "No se pudo subir la foto.", "error");
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal" style={{ maxWidth: "420px" }}>
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-camera"></i>
                        </div>
                        <h5 className="rs-modal-title">Agregar foto a la orden {orden.codigo_orden}</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-field">
                        <label className="rs-label">Tipo de foto</label>
                        <div style={{ display: "flex", gap: "16px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                                <input type="radio" checked={tipo === "Daño"} onChange={() => setTipo("Daño")} />
                                Daño encontrado
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                                <input type="radio" checked={tipo === "Reparación"} onChange={() => setTipo("Reparación")} />
                                Reparación realizada
                            </label>
                        </div>
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Foto</label>
                        <input type="file" accept="image/*" className="rs-input-white" onChange={onSeleccionar} />
                        {preview && (
                            <img src={preview} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Descripción (opcional)</label>
                        <textarea
                            className="rs-input-white"
                            rows={2}
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Ej: rayón en el guardabarros delantero"
                        />
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="rs-btn rs-btn-primary" onClick={handleSubir} disabled={subiendo}>
                        {subiendo ? "Subiendo..." : "Subir foto"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalAgregarFotoOrden;