import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import TableInsumosUsados from "../../components/prodtsUseServ/TablePrUSer";

const API_BASE_URL = "http://localhost:4000/api";

function InsumosUsadosPage() {
    const [insumosUsados, setInsumosUsados] = useState([]);
    const [busquedaOrden, setBusquedaOrden] = useState("");

    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const getInsumosUsados = () => {
        axios.get(`${API_BASE_URL}/insumos_usados_en_servicio/listar`)
            .then(res => {
                const dataExtraida = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setInsumosUsados(dataExtraida);
            })
            .catch(err => {
                console.error("Error al cargar insumos usados:", err);
                setInsumosUsados([]);
            });
    };

    useEffect(() => {
        getInsumosUsados();
    }, []);

    useEffect(() => {
        setPagina(1);
    }, [busquedaOrden]);

    // Filtro exclusivo por código de orden (ej: "ORD-001", "ord-1", "1")
    const filtrados = insumosUsados.filter(iu => {
        const codigo = String(iu.codigo_orden || "").toLowerCase();
        const termino = busquedaOrden.trim().toLowerCase();
        if (!termino) return true;
        return codigo.includes(termino) || codigo.replace(/^ord-0*/, "") === termino.replace(/^ord-0*/, "");
    });

    const inicio = (pagina - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(filtrados.length / porPagina) || 1;

    return (
        <div className="rs-page-light">
            <div className="rs-page-header">
                <div>
                    <h2 className="rs-page-title">
                        <i className="fas fa-boxes-stacked"></i>
                        Insumos Usados en Servicio
                    </h2>
                    <p className="rs-page-subtitle">
                        Reporte de insumos consumidos por orden de servicio
                    </p>
                </div>
            </div>

            <div className="rs-filters" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="rs-search-wrapper" style={{ flex: 1 }}>
                    <i className="fas fa-search rs-search-icon"></i>
                    <input
                        type="text"
                        className="rs-search-input"
                        placeholder="Buscar por código de orden (ej: ORD-001)..."
                        value={busquedaOrden}
                        onChange={(e) => setBusquedaOrden(e.target.value)}
                    />
                </div>
            </div>

            <TableInsumosUsados insumosUsados={paginados} />

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
        </div>
    );
}

export default InsumosUsadosPage;
