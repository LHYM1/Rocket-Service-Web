import { useEffect, useState } from "react";
import axios from '../../axiosConfig';
import EstadoOrden from "../../components/estOrdn/EstadoOrdnAgrEdt.jsx";
import TableEstOrden from "../../components/estOrdn/TableEstdOrden.jsx";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

function EstadoOrdenPage() {
  const [estadoOrd, setEstadoOrden] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const getEstadoOrden = () => {
    axios.get("/api/estado_de_orden_de_servicio/listar")
      .then(res => setEstadoOrden(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getEstadoOrden();
  }, []);

  const estdOrdSerFiltrados = estadoOrd.filter(estdOrden => {
    const idTexto = String(estdOrden.nombre_estado || "");
    return idTexto.toLowerCase().includes(busqueda.toLowerCase());
  });

  const inicio = (pagina - 1) * porPagina;
  const paginados = estdOrdSerFiltrados.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(estdOrdSerFiltrados.length / porPagina);

  return (
    <div className="rs-page-light">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <h2 className="rs-page-title">
            <i className="fa-solid fa-list-check"></i>{" "}
            Estados de Orden de Servicio
            <CategoriaBadge tipo="configuracion" />
          </h2>
          <p className="rs-page-subtitle">{estadoOrd.length} estados registrados</p>
        </div>
        <button
          className="rs-btn rs-btn-primary"
          onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
        >
          <i className="fa-solid fa-plus"></i>{" "}
          Agregar Estado
        </button>
      </div>

      {/* Filtros */}
      <div className="rs-filters">
        <div className="rs-search-wrapper">
          <i className="fa-solid fa-search rs-search-icon"></i>
          <input
            type="text"
            className="rs-search-input"
            placeholder="Buscar estado por nombre..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <TableEstOrden
        estadoOrd={paginados}
        setIdSeleccionado={(ts) => { setIdSeleccionado(ts); setShowModal(true); }}
        getEstadoOrden={getEstadoOrden}
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
        <EstadoOrden
          idSeleccionado={idSeleccionado}
          getEstadoOrden={getEstadoOrden}
          onClose={() => setShowModal(false)}
          onSuccess={() => getEstadoOrden()}
        />
      )}
    </div>
  );
}

export default EstadoOrdenPage;