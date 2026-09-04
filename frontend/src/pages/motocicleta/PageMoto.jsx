import { useEffect, useState } from "react";
import axios from "../../axiosConfig"; // Ajustado a tu instancia configurable de axios
import MotoEdAgr from "../../components/motocicleta/motoEdAgr";
import TableMoto from "../../components/motocicleta/TableMoto";

function MotocicletaPage() {
    const [moto, setMoto] = useState([]);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Paginación
    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const getMoto = () => {
        axios.get("http://localhost:4000/api/motocicleta/listar")
            .then(res => {
                // Procesa array directo o res.data.data si el controller envuelve la respuesta
                const dataExtraida = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setMoto(dataExtraida);
            })
            .catch(err => {
                console.error("Error al cargar motocicletas:", err);
                setMoto([]);
            });
    };

    useEffect(() => {
        getMoto();
    }, []);

    useEffect(() => {
        setPagina(1);
    }, [busqueda]);

    // Filtrado por placa o nombre/apellido del dueño
    const motosFiltradas = moto.filter(m => {
        const placa = String(m.placa || "").toLowerCase();
        const dueno = String(`${m.nombre_usuario || ""} ${m.apellido_usuario || ""}`).toLowerCase();
        const termino = busqueda.toLowerCase();
        return placa.includes(termino) || dueno.includes(termino);
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
                    </h2>
                    <p className="rs-page-subtitle">
                        Administra el parque automotor y asignación de motocicletas
                    </p>
                </div>
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

            {/* Filtros y Búsqueda */}
            <div className="rs-filters">
                <div className="rs-search-wrapper">
                    <i className="fas fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por placa o nombre de cliente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
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
                        Anterior
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
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modal para Crear / Editar */}
            {showModal && (
                <MotoEdAgr
                    idSeleccionado={idSeleccionado}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => getMoto()}
                />
            )}
        </div>
    );
}

export default MotocicletaPage;