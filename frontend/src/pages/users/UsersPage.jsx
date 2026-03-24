import { useEffect, useState } from "react";
import axios from "axios";
import UsersTable from "./UsersTable";
import UserModalAgr from "./UserModalAgr";

function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getUsuarios = () => {
    axios.get("http://localhost:4000/api/usuarios/listar")
      .then(res => setUsuarios(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  // Filtrar usuarios según búsqueda
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo_usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setIdSeleccionado(null);
            setShowModal(true);
          }}
        >
          Agregar Usuario
        </button>

        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <UsersTable
        user={usuariosFiltrados}
        setIdSeleccionado={(u) => {
          setIdSeleccionado(u);
          setShowModal(true);
        }}
        getUsuarios={getUsuarios}
      />

      {/* Modal de agregar/editar */}
      {showModal && (
        <UserModalAgr
          idSeleccionado={idSeleccionado}
          getUsuarios={getUsuarios}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default UsersPage;
