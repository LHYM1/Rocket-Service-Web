import { useEffect, useState } from "react";
import axios from "axios";
import EdtAgrImg from "../../components/imgDanos/EdtAgrImg";
import Table from "../../components/imgDanos/Table";

function ImgDanos () {
  const [imgDanos, setImgDanos] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

   // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  const getImgDanos = () => {
    axios.get("http://localhost:4000/api/imagenes_danos/listar")
      .then(res => setImgDanos(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getImgDanos();
  }, []);

  // Filtrar imagenes según búsqueda
  const imgFiltradas = imgDanos.filter(img => {
    // Convertimos el ID a texto con string 
    const idTexto = String(img.id_insumos_orden || "");
    return idTexto.toLowerCase().includes(busqueda.toLowerCase()); 
  });

  // Calcular imagenes de la página actual
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginados = imgFiltradas.slice(inicio, fin);

  // Número total de páginas
  const totalPaginas = Math.ceil(imgFiltradas.length / porPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de Imagenes Daños</h2>

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
          placeholder="Buscar imagenes daños"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <Table
        imgDanos={paginados}
        setIdSeleccionado={(img) => {
          setIdSeleccionado(img);
          setShowModal(true);
        }}
        getImgDanos={getImgDanos}
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
        <EdtAgrImg
          idSeleccionado={idSeleccionado}
          getImgDanos={getImgDanos}
          onClose={() => setShowModal(false)}
          onSuccess={() => getImgDanos()}
        />
      )}
    </div>
  );
}

export default ImgDanos;
