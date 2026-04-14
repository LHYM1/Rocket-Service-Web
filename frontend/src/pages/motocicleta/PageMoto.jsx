import { useEffect, useState } from "react";
import axios from "axios";
import MotoEdAgr from "../../components/motocicleta/motoEdAgr";
import TableMoto from "../../components/motocicleta/TableMoto";

function MotocicletaPage () {
  const [moto, setMoto] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getMoto = () => {
    axios.get("http://localhost:4000/api/motocicleta/listar")
      .then(res => setMoto(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getMoto();
  }, []);

  // Filtrar motos según búsqueda
  const insSerFiltrados = moto.filter(moto => {
    // Convertimos el ID a texto con string 
    const idTexto = String(moto.placa || "");
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
      <h2>Gestión de motocicletas</h2>

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
          placeholder="Buscar motocicleta por placa"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <TableMoto
        moto={paginados}
        setIdSeleccionado={(ts) => {
          setIdSeleccionado(ts);
          setShowModal(true);
        }}
        getMoto={getMoto}
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
        <MotoEdAgr
          idSeleccionado={idSeleccionado}
          getMoto={getMoto}
          onClose={() => setShowModal(false)}
          onSuccess={() => getMoto()}
        />
      )}
    </div>
  );
}

export default MotocicletaPage;
