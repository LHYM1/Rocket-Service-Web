import { useEffect, useState } from "react";
import axios from "axios";
import TableProdts from "../../components/products/TableProdts";
import ModalEdtAgrProd from "../../components/products/ModalEdtAgrProd";

function ProductsPage() {
  const [product, setProduct] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const productPorPagina = 3;

  const getProduct = () => {
    axios.get("http://localhost:4000/api/insumos/listar")
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getProduct();
  }, []);

  // Filtrar usuarios según búsqueda
  const productFiltrados = product.filter(ts =>
    (ts.codigo_insumo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular usuarios de la página actual
  const inicio = (pagina - 1) * productPorPagina;
  const fin = inicio + productPorPagina;
  const productPaginados = productFiltrados.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(productFiltrados.length / productPorPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión Insumos</h2>

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setIdSeleccionado(null);
            setShowModal(true);
          }}
        >
          Agregar Insumo
        </button>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar Insumo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <TableProdts
        product={productPaginados}
        setIdSeleccionado={(ts) => {
          setIdSeleccionado(ts);
          setShowModal(true);
        }}
        getProduct={getProduct}
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
        <ModalEdtAgrProd
          idSeleccionado={idSeleccionado}
          getProduct={getProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => getProduct()}
        />
      )}
    </div>
  );
}

export default ProductsPage;
