import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import UnidadMedEdtAgr from "../../components/unidadMedida/UnidMedEdtAgr";
import UnidadMedtTable from "../../components/unidadMedida/UnidMedtTable";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

function UnidadMedPage() {
  const [undMed, setUnidadMed] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const getUnidadMed = () => {
    axios.get("/api/unidad_de_medida/listar")
      .then(res => setUnidadMed(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getUnidadMed();
  }, []);

  // Se busca por NOMBRE (antes buscaba por ID numérico, poco útil)
  const unidMedFiltrados = undMed.filter(und =>
    (und.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (pagina - 1) * porPagina;
  const paginados = unidMedFiltrados.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(unidMedFiltrados.length / porPagina);

  return (
    <div className="rs-page-light">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <h2 className="rs-page-title">
            <i className="fa-solid fa-ruler"></i>{" "}
            Unidades de Medida
            <CategoriaBadge tipo="configuracion" />
          </h2>
          <p className="rs-page-subtitle">{undMed.length} unidades registradas</p>
        </div>
        <button
          className="rs-btn rs-btn-primary"
          onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
        >
          <i className="fa-solid fa-plus"></i>{" "}
          Agregar Unidad
        </button>
      </div>

      {/* Filtros */}
      <div className="rs-filters">
        <div className="rs-search-wrapper">
          <i className="fa-solid fa-search rs-search-icon"></i>
          <input
            type="text"
            className="rs-search-input"
            placeholder="Buscar unidad de medida por nombre..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <UnidadMedtTable
        undMed={paginados}
        setIdSeleccionado={(und) => { setIdSeleccionado(und); setShowModal(true); }}
        getUnidadMed={getUnidadMed}
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
        <UnidadMedEdtAgr
          idSeleccionado={idSeleccionado}
          getUnidadMed={getUnidadMed}
          onClose={() => setShowModal(false)}
          onSuccess={() => getUnidadMed()}
        />
      )}
    </div>
  );
}

export default UnidadMedPage;