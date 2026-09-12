import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import TypeServTable from "../../components/typeServices/TypeServTable";
import ModalEditAgrTs from "../../components/typeServices/ModalEditAgrTs";
import { useAuth } from "../../context/AuthContext";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

function TypeServPage() {
    const { esAdmin } = useAuth();
    const [tipServ, setTipServ] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState(true);

    const [pagina, setPagina] = useState(1);
    const tipServPorPagina = 8;

    const getTipoServicio = async () => {
        setCargando(true);
        try {
            const res = await axios.get("/api/tipo_servicio/listar");
            setTipServ(res.data);
        } catch (err) {
            console.error("Error al obtener tipos de servicio:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        getTipoServicio();
    }, []);

    const tipServFiltrados = tipServ.filter(ts => {
        const texto = busqueda.toLowerCase();
        const coincideBusqueda =
            (ts.nombre_servicio || "").toLowerCase().includes(texto) ||
            (ts.descripcion_servicio || "").toLowerCase().includes(texto);

        const coincideEstado =
            filtroEstado === "" ||
            String(ts.estado) === filtroEstado ||
            (filtroEstado === "1" && ts.estado === true) ||
            (filtroEstado === "0" && ts.estado === false);

        return coincideBusqueda && coincideEstado;
    });

    const inicio = (pagina - 1) * tipServPorPagina;
    const fin = inicio + tipServPorPagina;
    const tipServPaginados = tipServFiltrados.slice(inicio, fin);
    const totalPaginas = Math.ceil(tipServFiltrados.length / tipServPorPagina) || 1;

    return (
        <div className="rs-page-light">
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fa-solid fa-screwdriver-wrench"></i>
                        Gestión de Tipo de Servicio
                        <CategoriaBadge tipo="configuracion" />
                    </h2>
                    <p className="rs-page-subtitle">
                        Gestiona todos los servicios ofrecidos en el Taller
                    </p>
                </div>

                {esAdmin && (
                    <button 
                        className="rs-btn rs-btn-primary" 
                        onClick={() => { setIdSeleccionado(null); setShowModal(true); }}
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>Agregar tipo servicio</span>
                    </button>
                )}
            </div>

            <div className="rs-filters">
                <div className="rs-search-wrapper">
                    <i className="fa-solid fa-magnifying-glass rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar tipo servicio por nombre o descripción..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(1);
                        }}
                    />
                </div>

                <select
                    className="rs-select"
                    value={filtroEstado}
                    onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setPagina(1);
                    }}
                >
                    <option value="">Todos los estados</option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                </select>
            </div>

            {cargando ? (
                <div className="rs-empty">
                    <i className="fa-solid fa-spinner fa-spin rs-empty-icon" style={{ color: "var(--rs-naranja)" }}></i>
                    <p className="rs-empty-text">Cargando tipos de servicio...</p>
                </div>
            ) : (
                <TypeServTable
                    tipServ={tipServPaginados}
                    setIdSeleccionado={(ts) => {
                        setIdSeleccionado(ts);
                        setShowModal(true);
                    }}
                    esAdmin={esAdmin}
                    getTipoServicio={getTipoServicio}
                />
            )}

            {!cargando && tipServFiltrados.length > 0 && (
                <div className="rs-pagination">
                    <button 
                        className="rs-page-btn" 
                        disabled={pagina === 1}
                        onClick={() => setPagina(pagina - 1)}
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                            key={i}
                            className={`rs-page-btn ${pagina === i + 1 ? "active" : ""}`}
                            onClick={() => setPagina(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        className="rs-page-btn" 
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina(pagina + 1)}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {showModal && esAdmin && (
                <ModalEditAgrTs
                    idSeleccionado={idSeleccionado}
                    onClose={() => setShowModal(false)}
                    onSuccess={getTipoServicio}
                />
            )}
        </div>
    );
}

export default TypeServPage;