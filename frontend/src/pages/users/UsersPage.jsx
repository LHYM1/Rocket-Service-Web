import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import UsersTable from "../../components/users/UsersTable";
import ModalEdtMod from "../../components/users/ModalEdtMod";

function UsersPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [pagina, setPagina] = useState(1);
    const usuariosPorPagina = 8;

    const getUsuarios = () => {
        axios.get("http://localhost:4000/api/usuarios/listar")
            .then(res => setUsuarios(res.data))
            .catch(err => console.error("Error al obtener usuarios:", err));
    };

    useEffect(() => {
        getUsuarios();
    }, []);

    // Filtros combinados
    const usuariosFiltrados = usuarios.filter(u => {
        const texto = busqueda.toLowerCase();
        const coincideBusqueda =
            u.nombre?.toLowerCase().includes(texto) ||
            u.apellido?.toLowerCase().includes(texto) ||
            u.correo_usuario?.toLowerCase().includes(texto);

        const coincideCategoria = filtroCategoria === "" ||
            u.categoria_usuario?.toLowerCase() === filtroCategoria.toLowerCase();

        const coincideEstado = filtroEstado === "" || String(u.estado) === filtroEstado;

        return coincideBusqueda && coincideCategoria && coincideEstado;
    });

    const inicio = (pagina - 1) * usuariosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(inicio, inicio + usuariosPorPagina);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

    const categoriasUnicas = [...new Set(usuarios.map(u => u.categoria_usuario).filter(Boolean))];

    return (
        <div className="rs-page-light">
            {/* Header */}
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fa-solid fa-users"></i>
                        Gestión de Usuarios
                    </h2>
                    <p className="rs-page-subtitle">{usuarios.length} usuarios registrados</p>
                </div>
                <button
                    className="rs-btn rs-btn-primary"
                    onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
                >
                    <i className="fa-solid fa-user-plus"></i>
                    Agregar Usuario
                </button>
            </div>

            {/* Filtros */}
            <div className="rs-filters">
                <div className="rs-search-wrapper">
                    <i className="fa-solid fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por nombre, apellido o correo..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                    />
                </div>

                <select
                    className="rs-select"
                    value={filtroCategoria}
                    onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1); }}
                >
                    <option value="">Todas las categorías</option>
                    {categoriasUnicas.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    className="rs-select"
                    value={filtroEstado}
                    onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
                >
                    <option value="">Todos los estados</option>
                    <option value="2">Activo</option>
                    <option value="1">Pediente</option>
                    <option value="0">Inactivo</option>
                </select>
            </div>

            {/* Tabla */}
            <UsersTable
                user={usuariosPaginados}
                setIdSeleccionado={(u) => { setIdSeleccionado(u); setShowModal(true); }}
                getUsuarios={getUsuarios}
            />

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="rs-pagination">
                    <button
                        className="rs-page-btn"
                        onClick={() => setPagina(pagina - 1)}
                        disabled={pagina === 1}
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                            key={i}
                            className={`rs-page-btn ${pagina === i + 1 ? 'active' : ''}`}
                            onClick={() => setPagina(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="rs-page-btn"
                        onClick={() => setPagina(pagina + 1)}
                        disabled={pagina === totalPaginas}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <ModalEdtMod
                    idSeleccionado={idSeleccionado}
                    onClose={() => { setShowModal(false); setIdSeleccionado(null); }}
                    onSuccess={() => getUsuarios()}
                />
            )}
        </div>
    );
}

export default UsersPage;