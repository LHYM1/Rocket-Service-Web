import { useEffect, useState } from "react";
import axios from '../../axiosConfig';
import OrdersTable from "../../components/orders/OrdersTable";
import ModalEdtAgr from "../../components/orders/ModalEdtAgr";
import { useAuth } from "../../context/AuthContext";

function OrdenesPage() {
  const { esAdmin } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pagina, setPagina] = useState(1);
  const ordenesPorPagina = 6; // ← cambié a 6 para que salgan 3x3

  const getOrdenes = () => {
    const url = esAdmin
        ? "http://localhost:4000/api/ordenes_de_servicio/listar"
        : "http://localhost:4000/api/ordenes_de_servicio/mis-ordenes";

    axios.get(url)
        .then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setOrdenes(data);
        })
        .catch(err => console.error("Error al obtener órdenes:", err));
  };

  useEffect(() => {
    const handleOrdenActualizada = () => getOrdenes();
    window.addEventListener('ordenActualizada', handleOrdenActualizada);
    return () => window.removeEventListener('ordenActualizada', handleOrdenActualizada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { getOrdenes(); }, []);

  const ordenesFiltradas = ordenes.filter(o =>
    (o.nombre_cliente || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.descripcion_del_problema || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (o.nombre_estado || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  

  const inicio = (pagina - 1) * ordenesPorPagina;
  const ordenesPaginadas = ordenesFiltradas.slice(inicio, inicio + ordenesPorPagina);
  const totalPaginas = Math.ceil(ordenesFiltradas.length / ordenesPorPagina);

  return (
    <div className="container mt-4">
        <h2 className="fw-bold mb-4">
            <i className="fa-solid fa-screwdriver-wrench me-2"></i>
            {esAdmin ? "Gestión de Órdenes de Servicio" : "Mis Órdenes"}
        </h2>

        <div className="d-flex justify-content-between mb-4 gap-3">
            {esAdmin && (
                <button className="btn btn-success" onClick={() => { setIdSeleccionado(null); setShowModal(true); }}>
                    <i className="fa-solid fa-plus me-1"></i> Nueva Orden
                </button>
            )}
            <input
                type="text"
                className="form-control w-50"
                placeholder="Buscar por cliente, estado o problema..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            />
        </div>

        <OrdersTable
            ordenes={ordenesPaginadas}
            setIdSeleccionado={(o) => { setIdSeleccionado(o); setShowModal(true); }}
            getOrdenes={getOrdenes}
            esAdmin={esAdmin}
        />

        {totalPaginas > 1 && (
            <div className="d-flex justify-content-center mt-4">
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPagina(pagina - 1)}>Anterior</button>
                        </li>
                        {Array.from({ length: totalPaginas }, (_, i) => (
                            <li key={i} className={`page-item ${pagina === i + 1 ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setPagina(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${pagina === totalPaginas ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPagina(pagina + 1)}>Siguiente</button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}

        {showModal && esAdmin && (
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