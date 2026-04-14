import { useEffect, useState } from "react";
import axios from "axios";
import EstadoOrden from "../../components/estOrdn/EstadoOrdnAgrEdt.jsx";
import TableEstOrden from "../../components/estOrdn/TableEstdOrden.jsx";

function EstadoOrdenPage () {
  const [estadoOrd, setEstadoOrden] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getEstadoOrden = () => {
    axios.get("http://localhost:4000/api/estado_de_orden_de_servicio/listar")
      .then(res => setEstadoOrden(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getEstadoOrden();
  }, []);

  // Filtrar estado orden según búsqueda
  const estdOrdSerFiltrados = estadoOrd.filter(estdOrden => {
    // Convertimos el ID a texto con string 
    const idTexto = String(estdOrden.nombre_estado || "");
    return idTexto.toLowerCase().includes(busqueda.toLowerCase()); 
  });

  // Calcular usuarios de la página actual
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginados = estdOrdSerFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(estdOrdSerFiltrados.length / porPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de estados ordenes</h2>

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
          placeholder="Buscar estado orden por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <TableEstOrden
        estadoOrd={paginados}
        setIdSeleccionado={(ts) => {
          setIdSeleccionado(ts);
          setShowModal(true);
        }}
        getEstadoOrden={getEstadoOrden}
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
