import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import TableModelo from "../../components/modeloMoto/TableModelo";
import EdtAgrModelo from "../../components/modeloMoto/EdtAgrModelo";

function ModeloMoto() {
    const [modelo, setModelo] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [pagina, setPagina] = useState(1);
    const porPagina = 8;

    const getModelo = () => {
        axios.get("/api/modelo/listar")
            // El backend de este módulo envuelve la respuesta en { status, data } --
            // se saca el arreglo real de adentro. El "|| res.data" queda como
            // respaldo por si algún día cambia a devolver el arreglo directo.
            .then(res => setModelo(res.data.data || res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => { getModelo(); }, []);

    const modelosFiltrados = modelo.filter(m => {
        const coincideNombre = m.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        const coincideEstado = filtroEstado === "" || String(m.estado) === filtroEstado;
        return coincideNombre && coincideEstado;
    });

    const inicio = (pagina - 1) * porPagina;
    const modelosPaginados = modelosFiltrados.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(modelosFiltrados.length / porPagina);

    return (
        <div className="rs-page-light">
            {/* Header */}
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fa-solid fa-motorcycle"></i>{" "}
                        Gestión de Modelos de Motocicleta
                    </h2>
                    <p className="rs-page-subtitle">{modelo.length} modelos registrados</p>
                </div>
                <button
                    className="rs-btn rs-btn-primary"
                    onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
                >
                    <i className="fa-solid fa-plus"></i>{" "}
                    Agregar Modelo
                </button>
            </div>

            {/* Filtros */}
            <div className="rs-filters">
                <div className="rs-search-wrapper">
                    <i className="fa-solid fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por nombre..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                    />
                </div>

                <select
                    className="rs-select"
                    value={filtroEstado}
                    onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
                >
                    <option value="">Todos los estados</option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                </select>
            </div>

            {/* Tabla */}
            <TableModelo
                modelo={modelosPaginados}
                setIdSeleccionado={(m) => { setIdSeleccionado(m); setShowModal(true); }}
                getModelo={getModelo}
            />

            {/* Paginador */}
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

            {/* Modal */}
            {showModal && (
                <EdtAgrModelo
                    idSeleccionado={idSeleccionado}
                    onClose={() => { setShowModal(false); setIdSeleccionado(null); }}
                    onSuccess={() => getModelo()}
                />
            )}
        </div>
    );
}

export default ModeloMoto;