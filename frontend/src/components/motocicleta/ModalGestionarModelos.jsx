import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import TableModelo from "../modeloMoto/TableModelo";
import EdtAgrModelo from "../modeloMoto/EdtAgrModelo";

// Modal que agrupa la gestión de Modelos de motocicleta DENTRO de la pantalla
// de Motocicleta -- así se ahorra una pestaña completa del Sidebar, sin perder
// ninguna funcionalidad (agregar, editar, desactivar/reactivar modelo).
function ModalGestionarModelos({ onClose, onCambio }) {
    const [modelo, setModelo] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [showSubModal, setShowSubModal] = useState(false);
    const [pagina, setPagina] = useState(1);
    const porPagina = 6;

    const getModelo = () => {
        axios.get("/api/modelo/listar")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setModelo(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => { getModelo(); }, []);

    const modelosFiltrados = modelo.filter(m =>
        (m.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    const inicio = (pagina - 1) * porPagina;
    const modelosPaginados = modelosFiltrados.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(modelosFiltrados.length / porPagina);

    // Cuando se cierra este panel, se avisa al padre (Motocicleta) por si los
    // modelos cambiaron y hay que refrescar el <select> de modelos allá
    const handleClose = () => {
        onCambio?.();
        onClose();
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal" style={{ maxWidth: "720px", width: "92%" }}>
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-motorcycle"></i>
                        </div>
                        <h5 className="rs-modal-title">Gestionar Modelos de Motocicleta</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={handleClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-filters" style={{ marginBottom: "16px" }}>
                        <div className="rs-search-wrapper" style={{ flex: 1 }}>
                            <i className="fa-solid fa-search rs-search-icon"></i>
                            <input
                                type="text"
                                className="rs-search-input"
                                placeholder="Buscar modelo..."
                                value={busqueda}
                                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                            />
                        </div>
                        <button
                            className="rs-btn rs-btn-primary"
                            onClick={() => { setIdSeleccionado(null); setShowSubModal(true); }}
                        >
                            <i className="fa-solid fa-plus"></i>{" "}
                            Nuevo modelo
                        </button>
                    </div>

                    <TableModelo
                        modelo={modelosPaginados}
                        setIdSeleccionado={(m) => { setIdSeleccionado(m); setShowSubModal(true); }}
                        getModelo={getModelo}
                    />

                    {totalPaginas > 1 && (
                        <div className="rs-pagination">
                            <button
                                className="rs-page-btn"
                                onClick={() => setPagina(pagina - 1)}
                                disabled={pagina === 1}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPaginas }, (_, i) => (
                                <button
                                    key={`pagina-${i + 1}`}
                                    className={`rs-page-btn ${pagina === i + 1 ? 'active' : ''}`}
                                    onClick={() => setPagina(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="rs-page-btn"
                                onClick={() => setPagina(pagina + 1)}
                                disabled={pagina === totalPaginas}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={handleClose}>Cerrar</button>
                </div>
            </div>

            {showSubModal && (
                <EdtAgrModelo
                    idSeleccionado={idSeleccionado}
                    onClose={() => { setShowSubModal(false); setIdSeleccionado(null); }}
                    onSuccess={() => getModelo()}
                />
            )}
        </div>
    );
}

export default ModalGestionarModelos;