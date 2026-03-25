import { useEffect, useState } from "react";
import axios from "axios";
import RolesTable from "../../components/roles/RolesTable";
import ModalAgrEdt from "../../components/roles/ModalAgrEdt";

function UsersPage() {
  const [roles, setRoles] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const RolesPorPagina = 5;

  const getRoles = () => {
    axios.get("http://localhost:4000/api/clasificacion_de_usuarios/listar")
      .then(res => setRoles(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getRoles();
  }, []);

  // Filtrar usuarios según búsqueda
  const RolesFiltrados = roles.filter(r =>
    (r.categoria_usuario || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular usuarios de la página actual
  const inicio = (pagina - 1) * RolesPorPagina;
  const fin = inicio + RolesPorPagina;
  const rolesPaginados = RolesFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(RolesFiltrados.length / RolesPorPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de Roles</h2>

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setIdSeleccionado(null);
            setShowModal(true);
          }}
        >
          Agregar Rol
        </button>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <RolesTable
        roles={rolesPaginados}
        setIdSeleccionado={(u) => {
          setIdSeleccionado(u);
          setShowModal(true);
        }}
        getRoles={getRoles}
      />

      {/* Paginador */}
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPagina(pagina - 1)}>
                Anterior
              </button>
            </li>

            {Array.from({ length: totalPaginas }, (_, i) => (
              <li key={i} className={`page-item ${pagina === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPagina(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${pagina === totalPaginas ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPagina(pagina + 1)}>
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal de agregar/editar */}
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

export default UsersPage;
