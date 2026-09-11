import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from '../../axiosConfig';
import OrdersTable from "../../components/orders/OrdersTable";
import ClienteOrdersTable from "../../components/orders/ClienteOrdersTable";
import ModalEdtAgr from "../../components/orders/ModalEdtAgr";
import { useAuth } from "../../context/AuthContext";

function OrdenesPage() {
  const { esAdmin, esCliente } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pagina, setPagina] = useState(1);
  const ordenesPorPagina = 6;

  const getOrdenes = () => {
    const url = (esAdmin || esCliente)
        ? "/api/ordenes_de_servicio/listar"
        : "/api/ordenes_de_servicio/mis-ordenes";

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
            {esAdmin ? "Gestión de Órdenes de Servicio" : esCliente ? "Seguimiento de mi Orden" : "Mis Órdenes"}
        </h2>

        <div className="d-flex justify-content-between mb-4 gap-3">
            {esAdmin && (
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded"
                    style={{ backgroundColor: "#fff8ee", border: "1px solid #ff8c0040", fontSize: "0.85rem", color: "#9a5b00" }}>
                    <i className="fa-solid fa-circle-info"></i>
                    Las órdenes se crean desde una <strong>Pre-revisión</strong> que requiera reparación.{" "}
                    <Link to="/panel/pre-revision" style={{ color: "#ff8c00", fontWeight: "600" }}>Ir a Pre-revisiones →</Link>
                </div>
            )}
            <input
                type="text"
                className="form-control w-50"
                placeholder="Buscar por cliente, estado o problema..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            />
        </div>

        {esCliente ? (
            <ClienteOrdersTable
                ordenes={ordenesPaginadas}
                getOrdenes={getOrdenes}
            />
        ) : (
            <OrdersTable
                ordenes={ordenesPaginadas}
                setIdSeleccionado={(o) => { setIdSeleccionado(o); setShowModal(true); }}
                getOrdenes={getOrdenes}
                esAdmin={esAdmin}
            />
        )}

        {totalPaginas > 1 && (
            <div className="rs-pagination">
                <button
                    className="rs-page-btn"
                    onClick={() => setPagina(pagina - 1)}
                    disabled={pagina === 1}>
                    <i className="fa-solid fa-chevron-left" style={{ fontSize: "0.75rem" }}></i>
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                        key={i}
                        className={`rs-page-btn ${pagina === i + 1 ? "active" : ""}`}
                        onClick={() => setPagina(i + 1)}>
                        {i + 1}
                    </button>
                ))}

                <button
                    className="rs-page-btn"
                    onClick={() => setPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "0.75rem" }}></i>
                </button>
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