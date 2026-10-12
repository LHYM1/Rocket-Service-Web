import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import RegActAgrEdt from "../../components/regstActv/regActAgrEdt.jsx";
import RegstActvTable from "../../components/regstActv/regstActvTable.jsx";
import { useAuth } from "../../context/AuthContext";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

function RegActPage() {
  const [regstActv, setRegAct] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { esAdmin } = useAuth();

  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

  const getRegAct = () => {
    axios.get("/api/registro_actividad/listar")
      .then(res => setRegAct(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getRegAct();
  }, []);

  const regActFiltrados = regstActv.filter(rg =>
    (rg.estado_disponibilidad || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (rg.codigo_registro || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (pagina - 1) * porPagina;
  const paginados = regActFiltrados.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(regActFiltrados.length / porPagina);

  return (
    <div className="rs-page-light">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <h2 className="rs-page-title">
            <i className="fa-solid fa-clipboard-list"></i>{" "}
            Registro de Actividad
            <CategoriaBadge tipo="operacion" />
          </h2>
          <p className="rs-page-subtitle">{regstActv.length} registros</p>
        </div>
        {esAdmin && (
          <button
            className="rs-btn rs-btn-primary"
            onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
          >
            <i className="fa-solid fa-plus"></i>{" "}
            Agregar Registro
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="rs-filters">
        <div className="rs-search-wrapper">
          <i className="fa-solid fa-search rs-search-icon"></i>
          <input
            type="text"
            className="rs-search-input"
            placeholder="Buscar por código o estado del técnico..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <RegstActvTable
        regstActv={paginados}
        setIdSeleccionado={(ts) => { setIdSeleccionado(ts); setShowModal(true); }}
        getRegAct={getRegAct}
        esAdmin={esAdmin}
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

      {/* Modal solo Admin */}
      {showModal && esAdmin && (
        <RegActAgrEdt
          idSeleccionado={idSeleccionado}
          regstActv={regstActv}
          onClose={() => setShowModal(false)}
          onSuccess={() => getRegAct()}
        />
      )}
    </div>
  );
}

export default RegActPage;