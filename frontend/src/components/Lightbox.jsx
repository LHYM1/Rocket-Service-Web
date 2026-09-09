import { useState, useEffect, useCallback } from "react";

/**
 * Lightbox reutilizable para ampliar imágenes.
 * Props:
 *  - imagenes: array de objetos { url, descripcion } (o strings de URL directamente)
 *  - indiceInicial: en qué imagen abrir
 *  - onClose: función para cerrar
 */
function Lightbox({ imagenes, indiceInicial = 0, onClose }) {
    const [indice, setIndice] = useState(indiceInicial);
    const [zoom, setZoom] = useState(1);

    const lista = imagenes.map(img => typeof img === "string" ? { url: img, descripcion: "" } : img);
    const actual = lista[indice];

    const siguiente = useCallback(() => {
        setZoom(1);
        setIndice(i => (i + 1) % lista.length);
    }, [lista.length]);

    const anterior = useCallback(() => {
        setZoom(1);
        setIndice(i => (i - 1 + lista.length) % lista.length);
    }, [lista.length]);

    // Navegación con teclado: ESC cierra, flechas cambian de foto
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && lista.length > 1) siguiente();
            if (e.key === "ArrowLeft" && lista.length > 1) anterior();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, siguiente, anterior, lista.length]);

    const handleWheel = (e) => {
        e.preventDefault();
        setZoom(z => {
            const nuevo = z - e.deltaY * 0.001;
            return Math.min(Math.max(nuevo, 1), 3.5);
        });
    };

    const handleDoubleClick = () => {
        setZoom(z => (z > 1 ? 1 : 2));
    };

    if (!actual) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 3000,
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "lightboxFadeIn 0.2s ease both"
            }}
        >
            <style>{`
                @keyframes lightboxFadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            <button
                onClick={onClose}
                style={{
                    position: "absolute", top: 20, right: 24,
                    width: 40, height: 40, borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.12)", border: "none", color: "white",
                    fontSize: "1.2rem", cursor: "pointer", zIndex: 10,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}
                title="Cerrar (Esc)"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>

            {lista.length > 1 && (
                <div style={{
                    position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
                    color: "rgba(255,255,255,0.7)", fontSize: "0.85rem"
                }}>
                    {indice + 1} / {lista.length}
                </div>
            )}

            {lista.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); anterior(); }}
                    style={flechaEstilo("left")}
                    title="Anterior (←)"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
            )}

            <div
                onClick={(e) => e.stopPropagation()}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
                style={{
                    maxWidth: "85vw", maxHeight: "80vh",
                    overflow: "hidden", cursor: zoom > 1 ? "zoom-out" : "zoom-in",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}
            >
                <img
                    src={actual.url}
                    alt={actual.descripcion || "evidencia"}
                    style={{
                        maxWidth: "85vw", maxHeight: "80vh",
                        transform: `scale(${zoom})`,
                        transition: "transform 0.15s ease",
                        borderRadius: "6px",
                        userSelect: "none"
                    }}
                    draggable={false}
                />
            </div>

            {lista.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); siguiente(); }}
                    style={flechaEstilo("right")}
                    title="Siguiente (→)"
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            )}

            <div style={{
                position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", textAlign: "center", maxWidth: "80vw"
            }}>
                {actual.descripcion && <div style={{ marginBottom: 4 }}>{actual.descripcion}</div>}
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>
                    Doble clic o scroll para acercar
                </div>
            </div>
        </div>
    );
}

const flechaEstilo = (lado) => ({
    position: "absolute",
    [lado]: 16,
    top: "50%",
    transform: "translateY(-50%)",
    width: 44, height: 44, borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.12)", border: "none", color: "white",
    fontSize: "1.1rem", cursor: "pointer", zIndex: 10,
    display: "flex", alignItems: "center", justifyContent: "center"
});

export default Lightbox;