import { useEffect, useState } from "react";
import axios from "axios";
import ModalEdtAgrPrUser from "../../components/prodtsUseServ/ModalEdtAgrPrUSer";
import TablePrUSer from "../../components/prodtsUseServ/TablePrUSer";

function PrUsServPage() {
  const [insUsaServ, setInsUsaServ] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getInsUsServ = () => {
    axios.get("http://localhost:4000/api/insumos_usados_en_servicio/listar")
      .then(res => setInsUsaServ(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getInsUsServ();
  }, []);

  // Filtrar usuarios según búsqueda
  const insSerFiltrados = insUsaServ.filter(ts => {
    // Convertimos el ID a texto con string 
    const idTexto = String(ts.id_insumos_orden || "");
    return idTexto.toLowerCase().includes(busqueda.toLowerCase()); 
  });

  // Calcular usuarios de la página actual
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginados = insSerFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(insSerFiltrados.length / porPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión insumos usados en servicio</h2>

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setIdSeleccionado(null);
            setShowModal(true);
          }}
        >
          Agregar 
        </button>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar tipo servicio"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <TablePrUSer
        insUsaServ={paginados}
        setIdSeleccionado={(ts) => {
          setIdSeleccionado(ts);
          setShowModal(true);
        }}
        getInsUsServ={getInsUsServ}
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
        <ModalEdtAgrPrUser
          idSeleccionado={idSeleccionado}
          getInsUsServ={getInsUsServ}
          onClose={() => setShowModal(false)}
          onSuccess={() => getInsUsServ()}
        />
      )}
    </div>
  );
}

export default PrUsServPage;
