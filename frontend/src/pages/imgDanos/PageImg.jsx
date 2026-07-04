import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// ─── Vista Admin: tabla simple ───────────────────────────────────────────────
function TablaAdmin({ imgDanos, getImgDanos }) {
    const eliminar = (id) => {
        if (window.confirm("¿Eliminar esta imagen?")) {
            axios.delete(`http://localhost:4000/api/imagenes_danos/eliminar/${id}`)
                .then(() => getImgDanos())
                .catch(err => console.error(err));
        }
    };

    return (
        <table className="table table-hover">
            <thead className="table-light">
                <tr>
                    <th>Id</th>
                    <th>Orden</th>
                    <th>Descripción</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {imgDanos.map(img => (
                    <tr key={img.id_imagen}>
                        <td>{img.id_imagen}</td>
                        <td>{img.codigo_orden || `ORD-${String(img.id_orden).padStart(3,"0")}`}</td>
                        <td>{img.descripcion}</td>
                        <td>
                            {img.url_imagen && (
                                <a href={img.url_imagen} target="_blank" rel="noreferrer">
                                    <img src={img.url_imagen} alt="daño"
                                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                                </a>
                            )}
                        </td>
                        <td>
                            <button onClick={() => eliminar(img.id_imagen)}
                                className="btn btn-danger btn-sm">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ─── Card de orden con uploader para técnico ─────────────────────────────────
function CardOrdenImagenes({ orden, onImagenSubida }) {
    const { mostrarToast } = useToast();
    const [imagenes, setImagenes] = useState([]);
    const [previews, setPreviews]   = useState([]);
    const [subiendo, setSubiendo]   = useState(false);
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [confirmEliminar, setConfirmEliminar] = useState(null); // id_imagen a eliminar

    // Cargar imágenes existentes de esta orden
    const cargarImagenes = useCallback(async () => {
        try {
            const res = await axios.get(
                `http://localhost:4000/api/imagenes_danos/por-orden/${orden.id_orden}`
            );
            setImagenes(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [orden.id_orden]);

    useEffect(() => { cargarImagenes(); }, [cargarImagenes]);

    const onSeleccionarArchivos = (e) => {
        const archivos = Array.from(e.target.files);
        const nuevas = archivos.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            descripcion: ""
        }));
        setPreviews(prev => [...prev, ...nuevas]);
        e.target.value = ""; // reset input
    };

    const onDrop = (e) => {
        e.preventDefault();
        const archivos = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
        const nuevas = archivos.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            descripcion: ""
        }));
        setPreviews(prev => [...prev, ...nuevas]);
    };

    const quitarPreview = (idx) => {
        URL.revokeObjectURL(previews[idx].previewUrl);
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const actualizarDescripcion = (idx, valor) => {
        setPreviews(prev => prev.map((p, i) => i === idx ? { ...p, descripcion: valor } : p));
    };

    const subirImagenes = async () => {
        if (previews.length === 0) return;
        setSubiendo(true);
        try {
            for (const p of previews) {
                const formData = new FormData();
                formData.append("imagen", p.file);
                formData.append("id_orden", orden.id_orden);
                formData.append("descripcion", p.descripcion);
                await axios.post("http://localhost:4000/api/imagenes_danos/subir", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            // Limpiar previews
            previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
            setPreviews([]);
            await cargarImagenes();
            onImagenSubida(); // avisar al padre para re-validar
            mostrarToast(`${previews.length > 1 ? previews.length + " imágenes subidas" : "Imagen subida"} correctamente`);
        } catch (err) {
            console.error(err);
            mostrarToast("Error al subir imágenes", "error");
        } finally {
            setSubiendo(false);
        }
    };

    const inputRef = useRef();

    const confirmarEliminar = (idImagen) => setConfirmEliminar(idImagen);

    const eliminarImagen = async () => {
        if (!confirmEliminar) return;
        try {
            await axios.delete(`http://localhost:4000/api/imagenes_danos/eliminar/${confirmEliminar}`);
            setConfirmEliminar(null);
            await cargarImagenes();
            onImagenSubida();
            mostrarToast("Imagen eliminada correctamente");
        } catch (err) {
            console.error(err);
            mostrarToast("Error al eliminar la imagen", "error");
        }
    };

    const codigo = orden.codigo_orden || `ORD-${String(orden.id_orden).padStart(3,"0")}`;

    return (
        <>
        <style>{`
            @keyframes entradaCard {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .img-card { animation: entradaCard 0.38s ease both; }

            .drop-zone {
                border: 2px dashed #ff8c0060;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                cursor: pointer;
                transition: background 0.2s, border-color 0.2s;
                background: #fff9f0;
            }
            .drop-zone:hover, .drop-zone.drag-over {
                background: #fff3e0;
                border-color: #ff8c00;
            }
            .preview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 10px;
                margin-top: 12px;
            }
            .preview-item {
                position: relative;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #eee;
                background: #f8f9fa;
            }
            .preview-item img {
                width: 100%;
                height: 110px;
                object-fit: cover;
                display: block;
            }
            .preview-item .btn-x {
                position: absolute;
                top: 5px; right: 5px;
                width: 22px; height: 22px;
                border-radius: 50%;
                background: rgba(220,53,69,0.9);
                border: none;
                color: white;
                font-size: 0.7rem;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                line-height: 1;
            }
            .preview-item input {
                font-size: 0.72rem;
                border: none;
                border-top: 1px solid #eee;
                padding: 4px 6px;
                width: 100%;
                background: white;
                outline: none;
            }
            .img-guardada {
                position: relative;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #eee;
            }
            .img-guardada img {
                width: 100%;
                height: 110px;
                object-fit: cover;
                display: block;
            }
            .img-guardada .btn-x {
                position: absolute;
                top: 5px; right: 5px;
                width: 22px; height: 22px;
                border-radius: 50%;
                background: rgba(220,53,69,0.9);
                border: none;
                color: white;
                font-size: 0.7rem;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
            }
            .img-guardada small {
                display: block;
                font-size: 0.7rem;
                padding: 3px 6px;
                background: white;
                border-top: 1px solid #eee;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .panel-imgs {
                overflow: hidden;
                transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1),
                            opacity 0.32s ease, padding 0.32s ease;
            }
            .panel-imgs.abierto { max-height: 900px; opacity: 1; padding: 16px 20px; }
            .panel-imgs.cerrado { max-height: 0; opacity: 0; padding: 0 20px; }
        `}</style>

        <div className="img-card" style={{
            background: "white", borderRadius: 14,
            border: "1px solid #eee", overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.2s, transform 0.2s"
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.11)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
            {/* Header */}
            <div style={{ background: "#1a1a2e", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,140,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-camera" style={{ color: "#ff8c00" }}></i>
                    </div>
                    <div>
                        <span className="fw-bold text-white fs-6">{codigo}</span>
                        <small className="d-block text-white-50" style={{ fontSize: "0.72rem" }}>
                            {imagenes.length} foto{imagenes.length !== 1 ? "s" : ""} guardada{imagenes.length !== 1 ? "s" : ""}
                            {imagenes.length === 0 && <span className="ms-2" style={{ color: "#ff8c00" }}>⚠ Requerida al menos 1</span>}
                        </small>
                    </div>
                </div>
                <button
                    onClick={() => setPanelAbierto(v => !v)}
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", padding: "4px 12px", fontSize: "0.78rem", cursor: "pointer" }}>
                    <i className={`fa-solid fa-chevron-${panelAbierto ? "up" : "down"} me-1`} style={{ fontSize: "0.7rem" }}></i>
                    {panelAbierto ? "Cerrar" : "Adjuntar fotos"}
                </button>
            </div>

            {/* Panel expandible */}
            <div className={`panel-imgs ${panelAbierto ? "abierto" : "cerrado"}`}>

                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                    <i className="fa-solid fa-circle-info me-1" style={{ color: "#ff8c00" }}></i>
                    Agrega fotos de las partes de la moto a reparar. Se requiere al menos 1 para continuar.
                </p>

                {/* Drop zone */}
                <div className="drop-zone"
                    onClick={() => inputRef.current.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
                    onDragLeave={e => e.currentTarget.classList.remove("drag-over")}
                    onDrop={e => { e.currentTarget.classList.remove("drag-over"); onDrop(e); }}>
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "2rem", color: "#ff8c00" }}></i>
                    <p className="mt-2 mb-0 fw-semibold" style={{ color: "#ff8c00" }}>
                        Arrastra fotos aquí o haz clic para seleccionar
                    </p>
                    <small className="text-muted">JPG, PNG, WEBP</small>
                    <input ref={inputRef} type="file" accept="image/*" multiple
                        style={{ display: "none" }} onChange={onSeleccionarArchivos} />
                </div>

                {/* Previews pendientes de subir */}
                {previews.length > 0 && (
                    <div className="mt-3">
                        <small className="fw-semibold text-muted">Por subir ({previews.length})</small>
                        <div className="preview-grid">
                            {previews.map((p, idx) => (
                                <div key={idx} className="preview-item">
                                    <img src={p.previewUrl} alt="preview" />
                                    <button className="btn-x" onClick={() => quitarPreview(idx)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                    <input
                                        placeholder="Descripción..."
                                        value={p.descripcion}
                                        onChange={e => actualizarDescripcion(idx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn btn-sm text-white fw-semibold mt-3 w-100"
                            style={{ backgroundColor: "#ff8c00" }}
                            onClick={subirImagenes}
                            disabled={subiendo}>
                            {subiendo
                                ? <><i className="fa-solid fa-spinner fa-spin me-1"></i>Subiendo...</>
                                : <><i className="fa-solid fa-cloud-arrow-up me-1"></i>Subir {previews.length} foto{previews.length !== 1 ? "s" : ""}</>
                            }
                        </button>
                    </div>
                )}

                {/* Imágenes ya guardadas */}
                {imagenes.length > 0 && (
                    <div className="mt-3">
                        <small className="fw-semibold text-muted">Fotos guardadas ({imagenes.length})</small>
                        <div className="preview-grid">
                            {imagenes.map(img => (
                                <div key={img.id_imagen} className="img-guardada">
                                    <a href={img.url_imagen} target="_blank" rel="noreferrer">
                                        <img src={img.url_imagen} alt={img.descripcion} />
                                    </a>
                                    <button className="btn-x" onClick={() => confirmarEliminar(img.id_imagen)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                    {img.descripcion && <small>{img.descripcion}</small>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* Modal confirmación eliminar */}
        {confirmEliminar && (
            <div style={{
                position: "fixed", inset: 0, zIndex: 9998,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "fadeIn 0.2s ease"
            }}>
                <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
                <div style={{
                    background: "white", borderRadius: 16, padding: "28px 32px",
                    maxWidth: 380, width: "90%", textAlign: "center",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                    animation: "slideUpModal 0.25s ease"
                }}>
                    <style>{`@keyframes slideUpModal { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "#dc354520", margin: "0 auto 16px",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <i className="fa-solid fa-trash" style={{ color: "#dc3545", fontSize: "1.4rem" }}></i>
                    </div>
                    <h5 className="fw-bold mb-2">¿Eliminar imagen?</h5>
                    <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <button
                            className="btn fw-semibold px-4"
                            style={{ backgroundColor: "#f1f3f5", color: "#333", border: "none" }}
                            onClick={() => setConfirmEliminar(null)}>
                            Cancelar
                        </button>
                        <button
                            className="btn btn-danger fw-semibold px-4"
                            onClick={eliminarImagen}>
                            <i className="fa-solid fa-trash me-1"></i>Sí, eliminar
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────
function ImgDanos() {
    const { esAdmin } = useAuth();
    const [imgDanos, setImgDanos]     = useState([]);
    const [ordenes, setOrdenes]       = useState([]);
    const [busqueda, setBusqueda]     = useState("");
    const [pagina, setPagina]         = useState(1);
    const porPagina = 5;

    const getImgDanos = useCallback(() => {
        axios.get("http://localhost:4000/api/imagenes_danos/listar")
            .then(res => setImgDanos(res.data))
            .catch(err => console.error(err));
    }, []);

    const getOrdenesTecnico = useCallback(() => {
        axios.get("http://localhost:4000/api/imagenes_danos/mis-ordenes")
            .then(res => setOrdenes(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (esAdmin) getImgDanos();
        else getOrdenesTecnico();
    }, [esAdmin, getImgDanos, getOrdenesTecnico]);

    const imgFiltradas = imgDanos.filter(img =>
        String(img.id_imagen || "").includes(busqueda.toLowerCase()) ||
        String(img.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
    );
    const inicio = (pagina - 1) * porPagina;
    const paginados = imgFiltradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(imgFiltradas.length / porPagina);

    return (
        <div className="container mt-4">

            {esAdmin ? (
                <>
                    <h2 className="fw-bold mb-1">Imágenes de daños</h2>
                    <p className="text-muted mb-3">Fotos adjuntas por los técnicos en cada orden</p>
                    <div className="mb-3">
                        <input type="text" className="form-control w-50"
                            placeholder="Buscar por descripción..."
                            value={busqueda}
                            onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
                    </div>
                    <TablaAdmin imgDanos={paginados} getImgDanos={getImgDanos} />
                    {totalPaginas > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <nav><ul className="pagination">
                                <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setPagina(pagina - 1)}>Anterior</button>
                                </li>
                                {Array.from({ length: totalPaginas }, (_, i) => (
                                    <li key={i} className={`page-item ${pagina === i+1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setPagina(i+1)}>{i+1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${pagina === totalPaginas ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={() => setPagina(pagina + 1)}>Siguiente</button>
                                </li>
                            </ul></nav>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="mb-4">
                        <h2 className="fw-bold mb-1">
                            <i className="fa-solid fa-camera me-2" style={{ color: "#ff8c00" }}></i>
                            Fotos de daños
                        </h2>
                        <p className="text-muted">
                            Adjunta fotos de las órdenes en <strong>Esperando Repuestos</strong>. 
                            Necesitas al menos 1 foto para poder empezar el servicio.
                        </p>
                    </div>

                    {ordenes.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-camera" style={{ fontSize: "4rem", color: "#ff8c0030" }}></i>
                            <h5 className="mt-3 fw-bold text-muted">Sin órdenes pendientes</h5>
                            <p className="text-muted">Las órdenes en "Esperando Repuestos" aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {ordenes.map((orden, idx) => (
                                <div key={orden.id_orden} style={{ animationDelay: `${idx * 0.07}s` }}>
                                    <CardOrdenImagenes
                                        orden={orden}
                                        onImagenSubida={getOrdenesTecnico}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ImgDanos;