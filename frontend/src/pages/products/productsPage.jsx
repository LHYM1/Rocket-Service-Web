import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import TableProdts from "../../components/products/TableProdts";
import ModalEdtAgrProd from "../../components/products/ModalEdtAgrProd";

function ProductsPage() {
    const [product, setProduct] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [pagina, setPagina] = useState(1);
    const productPorPagina = 8;

    const getProduct = () => {
        axios.get("http://localhost:4000/api/insumos/listar")
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => { getProduct(); }, []);

    const productFiltrados = product.filter(p => {
        const coincideNombre = p.nombre_insumo?.toLowerCase().includes(busqueda.toLowerCase());
        const coincideEstado = filtroEstado === "" || String(p.estado) === filtroEstado;
        const coincideCategoria = filtroCategoria === "" ||
            p.categoria?.toLowerCase().includes(filtroCategoria.toLowerCase());
        return coincideNombre && coincideEstado && coincideCategoria;
    });

    const inicio = (pagina - 1) * productPorPagina;
    const productPaginados = productFiltrados.slice(inicio, inicio + productPorPagina);
    const totalPaginas = Math.ceil(productFiltrados.length / productPorPagina);
    const categoriasUnicas = [...new Set(product.map(p => p.categoria).filter(Boolean))];

    return (
        <div className="rs-page-light">
            {/* Header */}
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fa-solid fa-boxes-stacked"></i>
                        Gestión de Insumos
                    </h2>
                    <p className="rs-page-subtitle">{product.length} insumos registrados</p>
                </div>
                <button
                    className="rs-btn rs-btn-primary"
                    onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
                >
                    <i className="fa-solid fa-plus"></i>
                    Agregar Insumo
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
                    value={filtroCategoria}
                    onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1); }}
                >
                    <option value="">Todas las categorías</option>
                    {categoriasUnicas.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
                </select>

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
            <TableProdts
                product={productPaginados}
                setIdSeleccionado={(p) => { setIdSeleccionado(p); setShowModal(true); }}
                getProduct={getProduct}
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
                            key={i}
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
                <ModalEdtAgrProd
                    idSeleccionado={idSeleccionado}
                    onClose={() => { setShowModal(false); setIdSeleccionado(null); }}
                    onSuccess={() => getProduct()}
                />
            )}
        </div>
    );
}

export default ProductsPage;