import { useEffect, useState } from "react";
import axios from "axios";
import OrdersTable from "../../components/orders/OrdersTable";  
import ModalEdtAgr from "../../components/orders/ModalEdtAgr";

function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const ordenesPorPagina = 5;

  const getOrdenes = () => {
    
    axios.get("http://localhost:4000/api/ordenes_de_servicio/listar")
      .then(res => {
        // Validamos si la respuesta es el array directo o viene en .data
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setOrdenes(data);
      })
      .catch(err => console.error("Error al obtener órdenes:", err));
  };

  useEffect(() => {
    getOrdenes();
  }, []);

  // Filtrar órdenes por código de orden o descripción
  const ordenesFiltradas = ordenes.filter(o =>
    (o.codigo_orden || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.descripcion_del_problema || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Lógica de Paginación
  const inicio = (pagina - 1) * ordenesPorPagina;
  const fin = inicio + ordenesPorPagina;
  const ordenesPaginadas = ordenesFiltradas.slice(inicio, fin);
  const totalPaginas = Math.ceil(ordenesFiltradas.length / ordenesPorPagina);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-tools"></i> Gestión de Órdenes de Servicio</h2>

      </div>

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between mb-3 gap-3">
        <button
          className="btn btn-success"
          onClick={() => {
            setIdSeleccionado(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle"></i> Nueva Orden
        </button>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar por código (ORD-...) o problema..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1); // Reiniciar a la página 1 al buscar
          }}
        />
      </div>

      {/* Tabla de Órdenes */}
      <OrdersTable
        ordenes={ordenesPaginadas}
        setIdSeleccionado={(o) => {
          setIdSeleccionado(o);
          setShowModal(true);
        }}
        getOrdenes={getOrdenes}
      />

      {/* Paginador */}
      {totalPaginas > 1 && (
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
      )}

      {/* Modal de agregar/editar */}
      {showModal && (
        <ModalEdtAgr
          idSeleccionado={idSeleccionado}
          onClose={() => setShowModal(false)}
          onSuccess={() => getOrdenes()}
        />
      )}
    </div>
  );
}

export default OrdenesPage;