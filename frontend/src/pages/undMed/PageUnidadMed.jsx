import { useEffect, useState } from "react";
import axios from "axios";
import UnidadMedEdtAgr from "../../components/unidadMedida/UnidMedEdtAgr";
import UnidadMedtTable from "../../components/unidadMedida/UnidMedtTable";

function UnidadMedPage () {
  const [undMed, setUnidadMed] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getUnidadMed = () => {
    axios.get("/api/unidad_de_medida/listar")
      .then(res => setUnidadMed(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getUnidadMed();
  }, []);

  // Filtrar motos según búsqueda
  const unidMedFiltrados = undMed.filter(und => {
    // Convertimos el ID a texto con string 
    const idTexto = String(und.id_unidad || "");
    return idTexto.toLowerCase().includes(busqueda.toLowerCase()); 
  });

  // Calcular usuarios de la página actual
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginados = unidMedFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(unidMedFiltrados.length / porPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de unidades de medida</h2>

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
          placeholder="Buscar unidad de medida por id"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <UnidadMedtTable
        undMed={paginados}
        setIdSeleccionado={(und) => {
          setIdSeleccionado(und);
          setShowModal(true);
        }}
        getUnidadMed={getUnidadMed}
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
