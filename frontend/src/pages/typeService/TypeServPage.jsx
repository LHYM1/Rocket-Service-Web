import { useEffect, useState } from "react";
import axios from "axios";
import TypeServTable from "../../components/typeServices/TypeServTable";
import ModalEditAgrTs from "../../components/typeServices/ModalEditAgrTs";
import { useAuth } from "../../context/AuthContext";

function TypeServPage() {
   const { esAdmin } = useAuth();
  const [tipServ, setTipServ] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const tipServPorPagina = 3;

  const getTipoServicio = () => {
    axios.get("http://localhost:4000/api/tipo_servicio/listar")
      .then(res => setTipServ(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getTipoServicio();
  }, []);

  // Filtrar usuarios según búsqueda
  const tipServFiltrados = tipServ.filter(ts =>
    (ts.nombre_servicio || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular usuarios de la página actual
  const inicio = (pagina - 1) * tipServPorPagina;
  const fin = inicio + tipServPorPagina;
  const tipServPaginados = tipServFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(tipServFiltrados.length / tipServPorPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de Tipo servicio</h2> 

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between mb-3">

        {/* Botón solo Admin */}
        {esAdmin && (
          <button className="btn btn-primary" onClick={() => { setIdSeleccionado(null); setShowModal(true); }}>
            Agregar tipo servicio
          </button>
        )}

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar tipo servicio"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <TypeServTable
        tipServ={tipServPaginados}
        setIdSeleccionado={(ts) => {
          setIdSeleccionado(ts);
          setShowModal(true); }}
        esAdmin={esAdmin}
        getTipoServicio={getTipoServicio}
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
      {showModal && esAdmin && (
        <ModalEditAgrTs
          idSeleccionado={idSeleccionado}
          getTipoServicio={getTipoServicio}
          onClose={() => setShowModal(false)}
          onSuccess={() => getTipoServicio()}
        />
      )}
    </div>
  );
}

export default TypeServPage;
