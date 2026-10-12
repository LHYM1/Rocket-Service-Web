import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import MotoEdAgr from "../../components/motocicleta/motoEdAgr";
import TableMoto from "../../components/motocicleta/TableMoto";
import ModalGestionarModelos from "../../components/motocicleta/ModalGestionarModelos";
import CategoriaBadge from "../../components/ui/CategoriaBadge";

// URL absoluta del Backend Express
const API_BASE_URL = "/api";

function MotocicletaPage() {
    const [moto, setMoto] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showModalModelos, setShowModalModelos] = useState(false);

    // Filtros
    const [busqueda, setBusqueda] = useState("");
    const [filtroModelo, setFiltroModelo] = useState("");

    // Paginación
    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const getMoto = () => {
        axios.get(`${API_BASE_URL}/motocicleta/listar`)
            .then(res => {
                const dataExtraida = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setMoto(dataExtraida);
            })
            .catch(err => {
                console.error("Error al cargar motocicletas:", err);
                setMoto([]);
            });
    };

    const getModelos = () => {
        axios.get(`${API_BASE_URL}/modelo/listar`)
            .then(res => {
                const dataExtraida = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setModelos(dataExtraida);
            })
            .catch(err => console.error("Error al cargar lista de modelos:", err));
    };

    useEffect(() => {
        getMoto();
        getModelos();
    }, []);

    useEffect(() => {
        setPagina(1);
    }, [busqueda, filtroModelo]);

    // Filtrado por Placa/Cliente y por Modelo opcional
    const motosFiltradas = moto.filter(m => {
        const placa = String(m.placa || "").toLowerCase();
        const dueno = String(`${m.nombre_usuario || ""} ${m.apellido_usuario || ""}`).toLowerCase();
        const termino = busqueda.toLowerCase();

        const coincideTermino = placa.includes(termino) || dueno.includes(termino);
        const coincideModelo = filtroModelo === "" || String(m.id_modelo) === String(filtroModelo);

        return coincideTermino && coincideModelo;
    });

    const inicio = (pagina - 1) * porPagina;
    const paginados = motosFiltradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(motosFiltradas.length / porPagina) || 1;

    return (
        <div className="rs-page-light">
            {/* Encabezado */}
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fas fa-motorcycle"></i>
                        Gestión de Motocicletas
                        <CategoriaBadge tipo="inventario" />
                    </h2>
                    <p className="rs-page-subtitle">
                        Administra el parque automotor y asignación de motocicletas
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        className="rs-btn rs-btn-secondary"
                        onClick={() => setShowModalModelos(true)}
                    >
                        <i className="fas fa-motorcycle"></i> Gestionar modelos
                    </button>
                    <button
                        className="rs-btn rs-btn-primary"
                        onClick={() => {
                            setIdSeleccionado(null);
                            setShowModal(true);
                        }}
                    >
                        <i className="fas fa-plus"></i> Registrar Motocicleta
                    </button>
                </div>
            </div>

            {/* Filtros: Búsqueda global + Select de Modelo */}
            <div className="rs-filters" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="rs-search-wrapper" style={{ flex: 1 }}>
                    <i className="fas fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por placa o nombre de cliente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div style={{ minWidth: "200px" }}>
                    <select
                        className="rs-input-white"
                        style={{ height: "42px" }}
                        value={filtroModelo}
                        onChange={(e) => setFiltroModelo(e.target.value)}
                    >
                        <option value="">Todos los modelos</option>
                        {modelos.map(mod => (
                            <option key={mod.id_modelo} value={mod.id_modelo}>
                                {mod.nombre_modelo || mod.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla con datos filtrados */}
            <TableMoto
                moto={paginados}
                setIdSeleccionado={(mt) => {
                    setIdSeleccionado(mt);
                    setShowModal(true);
                }}
                getMoto={getMoto}
            />

            {/* Paginador */}
            {totalPaginas > 1 && (
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
                            key={i + 1}
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

            {/* Modal para Crear / Editar */}
            {showModal && (
                <MotoEdAgr
                    idSeleccionado={idSeleccionado}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        getMoto();
                        getModelos();
                    }}
                />
            )}

            {/* Modal de gestión de Modelos (fusionado aquí, ya no es una pestaña aparte) */}
            {showModalModelos && (
                <ModalGestionarModelos
                    onClose={() => setShowModalModelos(false)}
                    onCambio={() => getModelos()}
                />
            )}
        </div>
    );
}

export default MotocicletaPage;