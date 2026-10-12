import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import EdtAgrCategoria from "../../components/categoryMot/EdtAgrCategory";
import TableCategory from "../../components/categoryMot/TableCategory";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

function CategoryMotPage() {
  const [categoria, setCategoria] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const getCategoria = () => {
    axios.get("/api/categoria/listar")
      .then(res => setCategoria(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getCategoria();
  }, []);

  const catgFiltrados = categoria.filter(cat => {
    const idTexto = String(cat.nombre || "");
    return idTexto.toLowerCase().includes(busqueda.toLowerCase());
  });

  const inicio = (pagina - 1) * porPagina;
  const paginados = catgFiltrados.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(catgFiltrados.length / porPagina);

  return (
    <div className="rs-page-light">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <h2 className="rs-page-title">
            <i className="fa-solid fa-tags"></i>{" "}
            Categorías de Insumos
            <CategoriaBadge tipo="configuracion" />
          </h2>
          <p className="rs-page-subtitle">{categoria.length} categorías registradas</p>
        </div>
        <button
          className="rs-btn rs-btn-primary"
          onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
        >
          <i className="fa-solid fa-plus"></i>{" "}
          Agregar Categoría
        </button>
      </div>

      {/* Filtros */}
      <div className="rs-filters">
        <div className="rs-search-wrapper">
          <i className="fa-solid fa-search rs-search-icon"></i>
          <input
            type="text"
            className="rs-search-input"
            placeholder="Buscar categoría por nombre..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <TableCategory
        categoria={paginados}
        setIdSeleccionado={(cat) => { setIdSeleccionado(cat); setShowModal(true); }}
        getCategoria={getCategoria}
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
        <EdtAgrCategoria
          idSeleccionado={idSeleccionado}
          getCategoria={getCategoria}
          onClose={() => setShowModal(false)}
          onSuccess={() => getCategoria()}
        />
      )}
    </div>
  );
}

export default CategoryMotPage;