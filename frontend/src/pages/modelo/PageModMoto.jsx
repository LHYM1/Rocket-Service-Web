import { useEffect, useState } from "react";
import axios from "axios";
import EdtAgrModelo from "../../components/modeloMoto/EdtAgrModelo";
import TableModelo from "../../components/modeloMoto/TableModelo";

function ModeloPage () {
  const [modelo, setModelo] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getModelo = () => {
    axios.get("http://localhost:4000/api/modelo/listar")
      .then(res => setModelo(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getModelo();
  }, []);

  // Filtrar motos según búsqueda
  const insSerFiltrados = modelo.filter(mod => {
    // Convertimos el ID a texto con string 
    const idTexto = String(mod.nombre || "");
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
      <h2>Gestión Modelos motocicleta</h2>

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
          placeholder="Buscar modelo por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <TableModelo
        modelo={paginados}
        setIdSeleccionado={(ts) => {
          setIdSeleccionado(ts);
          setShowModal(true);
        }}
        getModelo={getModelo}
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
        <EdtAgrModelo
          idSeleccionado={idSeleccionado}
          getModelo={getModelo}
          onClose={() => setShowModal(false)}
          onSuccess={() => getModelo()}
        />
      )}
    </div>
  );
}

export default ModeloPage;
