import { useEffect, useState } from "react";
import axios from "axios";
import RegActAgrEdt from "../../components/regstActv/regActAgrEdt.jsx";
import RegstActvTable from "../../components/regstActv/regstActvTable.jsx";
import { useAuth } from "../../context/AuthContext";

function RegActPage() {
  const [regstActv, setRegAct] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { esAdmin } = useAuth();
  

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getRegAct = () => {
    axios.get("/api/registro_actividad/listar")
      .then(res => setRegAct(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getRegAct();
  }, []);

  // Filtrar registros de actividad según búsqueda
  const regActFiltrados = regstActv.filter(rg => 
    (rg.estado_disponibilidad || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular registros de la página actual
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginados = regActFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(regActFiltrados.length / porPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de registros de actividad</h2>

        {/* Botón solo Admin */}
        <div className="d-flex justify-content-between mb-3">
        {esAdmin && (
          <button className="btn btn-primary" onClick={() => { setIdSeleccionado(null); setShowModal(true); }}>
            Agregar
          </button>
        )}

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar por estado del técnico"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Pasar esAdmin a la tabla */}
      <RegstActvTable
        regstActv={paginados}
        setIdSeleccionado={(ts) => { setIdSeleccionado(ts); setShowModal(true); }}
        getRegAct={getRegAct}
        esAdmin={esAdmin}
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
