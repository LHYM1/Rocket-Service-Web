import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import CategoriaEditAgr from "../../components/categoryProdts/EdtAgrCategory";
import TableCategoria from "../../components/categoryProdts/TableCategory";

const API_BASE_URL = "http://localhost:4000/api";

function CategoriaPage() {
    const [categorias, setCategorias] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filtros
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    // Paginación
    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const getCategoria = () => {
        axios.get(`${API_BASE_URL}/categoria/listar`)
            .then(res => {
                const dataExtraida = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setCategorias(dataExtraida);
            })
            .catch(err => {
                console.error("Error al cargar categorías:", err);
                setCategorias([]);
            });
    };

    useEffect(() => {
        getCategoria();
    }, []);

    useEffect(() => {
        setPagina(1);
    }, [busqueda, filtroEstado]);

    // Filtrado por nombre y por estado
    const categoriasFiltradas = categorias.filter(c => {
        const nombre = String(c.nombre || "").toLowerCase();
        const termino = busqueda.toLowerCase();

        const coincideTermino = nombre.includes(termino);
        const coincideEstado = filtroEstado === "" || String(c.estado) === filtroEstado;

        return coincideTermino && coincideEstado;
    });

    const inicio = (pagina - 1) * porPagina;
    const paginados = categoriasFiltradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(categoriasFiltradas.length / porPagina) || 1;

    return (
        <div className="rs-page-light">
            {/* Encabezado */}
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fas fa-tags"></i>
                        Gestión de Categorías de Insumos
                    </h2>
                    <p className="rs-page-subtitle">
                        Administra las categorías utilizadas para clasificar los insumos
                    </p>
                </div>
                <button
                    className="rs-btn rs-btn-primary"
                    onClick={() => {
                        setIdSeleccionado(null);
                        setShowModal(true);
                    }}
                >
                    <i className="fas fa-plus"></i> Registrar Categoría
                </button>
            </div>

            {/* Filtros: búsqueda + estado */}
            <div className="rs-filters" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="rs-search-wrapper" style={{ flex: 1 }}>
                    <i className="fas fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por nombre de categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div style={{ minWidth: "180px" }}>
                    <select
                        className="rs-input-white"
                        style={{ height: "42px" }}
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="1">Activas</option>
                        <option value="0">Inactivas</option>
                    </select>
                </div>
            </div>

            {/* Tabla con datos filtrados */}
            <TableCategoria
                categorias={paginados}
                setIdSeleccionado={(cat) => {
                    setIdSeleccionado(cat);
                    setShowModal(true);
                }}
                getCategoria={getCategoria}
            />

            {/* Paginador */}
            {totalPaginas > 1 && (
                <div className="rs-pagination">
                    <button
                        className="rs-page-btn"
                        disabled={pagina === 1}
                        onClick={() => setPagina(pagina - 1)}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`rs-page-btn ${pagina === i + 1 ? "active" : ""}`}
                            onClick={() => setPagina(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="rs-page-btn"
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina(pagina + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modal para Crear / Editar */}
            {showModal && (
                <CategoriaEditAgr
                    idSeleccionado={idSeleccionado}
                    onClose={() => setShowModal(false)}
                    onSuccess={getCategoria}
                />
            )}
        </div>
    );
}

export default CategoriaPage;
