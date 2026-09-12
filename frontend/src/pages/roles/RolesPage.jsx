import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import RolesTable from "../../components/roles/RolesTable";
import ModalAgrEdt from "../../components/roles/ModalAgrEdt";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [pagina, setPagina] = useState(1);
  const rolesPorPagina = 8;

  const getRoles = () => {
    axios.get("/api/clasificacion_de_usuarios/listar")
      .then(res => setRoles(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getRoles();
  }, []);

  const rolesFiltrados = roles.filter(r =>
    (r.categoria_usuario || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const inicio = (pagina - 1) * rolesPorPagina;
  const rolesPaginados = rolesFiltrados.slice(inicio, inicio + rolesPorPagina);
  const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);

  return (
    <div className="rs-page-light">
      {/* Header */}
      <div className="rs-page-header">
        <div>
          <h2 className="rs-page-title">
            <i className="fa-solid fa-user-tag"></i>{" "}
            Gestión de Roles
            <CategoriaBadge tipo="configuracion" />
          </h2>
          <p className="rs-page-subtitle">{roles.length} roles registrados</p>
        </div>
        <button
          className="rs-btn rs-btn-primary"
          onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
        >
          <i className="fa-solid fa-plus"></i>{" "}
          Agregar Rol
        </button>
      </div>

      {/* Filtros */}
      <div className="rs-filters">
        <div className="rs-search-wrapper">
          <i className="fa-solid fa-search rs-search-icon"></i>
          <input
            type="text"
            className="rs-search-input"
            placeholder="Buscar rol..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
      </div>

      {/* Tabla */}
      <RolesTable
        roles={rolesPaginados}
        setIdSeleccionado={(u) => { setIdSeleccionado(u); setShowModal(true); }}
        getRoles={getRoles}
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
        <ModalAgrEdt
          idSeleccionado={idSeleccionado}
          getRoles={getRoles}
          onClose={() => setShowModal(false)}
          onSuccess={() => getRoles()}
        />
      )}
    </div>
  );
}

export default RolesPage;