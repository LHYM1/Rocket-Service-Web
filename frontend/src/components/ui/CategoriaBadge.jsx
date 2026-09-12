// Etiqueta pequeña que indica a qué categoría funcional pertenece una pantalla,
// para que el Admin ubique de un vistazo si está en algo de uso diario o de
// configuración de fondo. Se usa junto al título de cada página (rs-page-title).
const CATEGORIAS = {
    operacion: { texto: "Operación diaria", color: "#ff7300", bg: "#ff730015" },
    configuracion: { texto: "Configuración", color: "#64748b", bg: "#64748b15" },
    inventario: { texto: "Inventario y flota", color: "#0d9488", bg: "#0d948815" },
    personas: { texto: "Personas", color: "#8b5cf6", bg: "#8b5cf615" },
};

const CategoriaBadge = ({ tipo }) => {
    const c = CATEGORIAS[tipo];
    if (!c) return null;

    return (
        <span style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: "600",
            color: c.color,
            backgroundColor: c.bg,
            padding: "3px 10px",
            borderRadius: "20px",
            marginLeft: "10px",
            verticalAlign: "middle"
        }}>
            {c.texto}
        </span>
    );
};

export default CategoriaBadge;