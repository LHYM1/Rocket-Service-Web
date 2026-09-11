import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const { mostrarToast } = useToast();

    const [ insumo, setInsumo ] = useState({
        id_categoria : "",
        id_unidad : "",
        nombre_insumo: "",
        cantidad_disponible: "",   // solo se usa al REGISTRAR (HU-004.1)
        cantidad_a_agregar: "",    // solo se usa al ACTUALIZAR (HU-004.3, suma al stock actual)
        precio_unitario: "",
    });

    // Para cargar categorías y unidades en los select
    const [categorias, setCategorias] = useState([]);
    const [unidades, setUnidades] = useState([]);

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setInsumo({
                id_categoria: idSeleccionado.id_categoria,
                id_unidad: idSeleccionado.id_unidad,
                nombre_insumo: idSeleccionado.nombre_insumo,
                cantidad_disponible: idSeleccionado.cantidad_disponible,
                cantidad_a_agregar: "",
                precio_unitario: idSeleccionado.precio_unitario,
            })
        }
    }, [idSeleccionado]);

    // useEffect para cargar categorias y unidades
    useEffect(() => {
        const fetchData = async () => {
            const categoria = await axios.get("/api/categoria/listar");
            setCategorias(categoria.data);

            const unidad = await axios.get("/api/unidad_de_medida/listar");
            setUnidades(unidad.data);
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInsumo({...insumo, [name]: value });
    }

    // Formatea el precio con puntos de miles mientras el usuario escribe (ej. 5000 -> 5.000)
    const handlePrecioChange = (e) => {
        const soloNumeros = e.target.value.replace(/\D/g, ""); // quita todo lo que no sea dígito
        setInsumo({ ...insumo, precio_unitario: soloNumeros });
    };

    const formatearPrecio = (valor) => {
        if (valor === "" || valor === null || valor === undefined) return "";
        return Number(valor).toLocaleString('es-CO');
    };

    const simboloUnidadActual = unidades.find(u => u.id_unidad === Number(insumo.id_unidad))?.simbolo || "";

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Actualizar (HU-004.3) — la cantidad a agregar es opcional, y SUMA al stock actual.
                // El precio SÍ es editable ahora (reemplaza, no suma). El tipo de medida no se envía: no es editable (RN-002).
                if (insumo.cantidad_a_agregar !== "" && Number(insumo.cantidad_a_agregar) <= 0) {
                    mostrarToast("La cantidad a agregar debe ser mayor a cero.", "warning");
                    return;
                }
                if (!insumo.precio_unitario || Number(insumo.precio_unitario) < 1000) {
                    mostrarToast("El precio unitario debe ser de al menos $1.000.", "warning");
                    return;
                }

                await axios.put(
                    `/api/insumos/modificar/${idSeleccionado.id_insumo}`,
                    {
                        id_categoria: insumo.id_categoria,
                        nombre_insumo: insumo.nombre_insumo,
                        cantidad_a_agregar: insumo.cantidad_a_agregar,
                        precio_unitario: insumo.precio_unitario
                    }
                );
                mostrarToast("Insumo actualizado correctamente.", "success");
            } else {
                // Registrar (HU-004.1) — validación básica en cliente antes de llamar al backend
                if (!insumo.cantidad_disponible || Number(insumo.cantidad_disponible) <= 0) {
                    mostrarToast("La cantidad inicial del insumo debe ser mayor a cero.", "warning");
                    return;
                }
                if (!insumo.precio_unitario || Number(insumo.precio_unitario) < 1000) {
                    mostrarToast("El precio unitario debe ser de al menos $1.000.", "warning");
                    return;
                }

                await axios.post(
                    `/api/insumos/crear`, insumo
                );

                mostrarToast("Insumo agregado con éxito", "success");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Detalle del error:", error.response ? error.response.data : error.message);
            // Mostrar el mensaje específico que manda el backend (nombre duplicado, categoría inactiva, etc.)
            const mensajeBackend = error.response?.data?.message;
            mostrarToast(mensajeBackend || "Hubo un error al guardar el insumo", "error");
        }
    };

    return (
    <div className="rs-modal-overlay">
        <div className="rs-modal">

            <div className="rs-modal-header">
                <div className="rs-modal-header-left">
                    <div className="rs-modal-icon">
                        <i className="fa-solid fa-box"></i>
                    </div>
                    <h5 className="rs-modal-title">
                        {idSeleccionado ? "Editar Insumo" : "Registrar Insumo"}
                    </h5>
                </div>
                <button type="button" className="rs-modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="rs-modal-body">

                <div className="rs-field">
                    <label className="rs-label" htmlFor="insumo-categoria">Categoria <span className="rs-required">*</span></label>
                    <select
                        id="insumo-categoria"
                        className="rs-input-white"
                        name="id_categoria"
                        value={insumo.id_categoria}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una categoria</option>
                        {categorias.map((cat) => (
                            <option key={cat.id_categoria} value={cat.id_categoria}>
                             {cat.nombre} 
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rs-field">
                    <label className="rs-label" htmlFor="insumo-unidad">
                        Unidad de medida <span className="rs-required">*</span>
                        {idSeleccionado && <span className="rs-hint"> (no editable)</span>}
                    </label>
                    <select
                        id="insumo-unidad"
                        className="rs-input-white"
                        name="id_unidad"
                        value={insumo.id_unidad}
                        onChange={handleChange}
                        required
                        disabled={!!idSeleccionado}
                    >
                        <option value="">Seleccione una unidad de medida</option>
                        {unidades.map((ins) => (
                            <option key={ins.id_unidad} value={ins.id_unidad}>
                             {ins.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rs-field">
                    <label className="rs-label" htmlFor="insumo-nombre">Insumo <span className="rs-required">*</span></label>
                    <input
                        id="insumo-nombre"
                        type="text"
                        className="rs-input-white"
                        name="nombre_insumo"
                        value={insumo.nombre_insumo}
                        onChange={handleChange}
                        placeholder="Nombre del insumo"
                    />
                </div>

                {!idSeleccionado ? (
                    // Registrar (HU-004.1): cantidad inicial exacta
                    <div className="rs-field">
                        <label className="rs-label" htmlFor="insumo-cantidad-inicial">Cantidad inicial <span className="rs-required">*</span></label>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <input
                                id="insumo-cantidad-inicial"
                                type="number"
                                min="1"
                                step="1"
                                className="rs-input-white"
                                name="cantidad_disponible"
                                value={insumo.cantidad_disponible}
                                onChange={handleChange}
                                placeholder="Cantidad mayor a cero"
                            />
                            {simboloUnidadActual && (
                                <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {simboloUnidadActual}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    // Actualizar (HU-004.3): cantidad a agregar, opcional, suma al stock actual
                    <div className="rs-field">
                        <label className="rs-label" htmlFor="insumo-cantidad-agregar">Cantidad a agregar</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <input
                                id="insumo-cantidad-agregar"
                                type="number"
                                min="1"
                                step="1"
                                className="rs-input-white"
                                name="cantidad_a_agregar"
                                value={insumo.cantidad_a_agregar}
                                onChange={handleChange}
                                placeholder={`Stock actual: ${insumo.cantidad_disponible} ${simboloUnidadActual}`}
                            />
                            {simboloUnidadActual && (
                                <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {simboloUnidadActual}
                                </span>
                            )}
                        </div>
                        <span className="rs-hint">Este valor se SUMA al stock actual. Déjalo vacío si no quieres cambiar la cantidad.</span>
                    </div>
                )}

                {/* Precio unitario: editable tanto al registrar como al actualizar */}
                <div className="rs-field">
                    <label className="rs-label" htmlFor="insumo-precio">Precio unitario <span className="rs-required">*</span></label>
                    <input
                        id="insumo-precio"
                        type="text"
                        inputMode="numeric"
                        className="rs-input-white"
                        name="precio_unitario"
                        value={formatearPrecio(insumo.precio_unitario)}
                        onChange={handlePrecioChange}
                        placeholder="Mínimo $1.000"
                    />
                    {idSeleccionado && (
                        <span className="rs-hint">Este valor reemplaza el precio anterior (no se suma).</span>
                    )}
                </div>

            </div>

            <div className="rs-modal-footer">
                <button className="rs-btn rs-btn-secondary" onClick={onClose}>
                    Cancelar
                </button>
                <button className="rs-btn rs-btn-primary" onClick={handleSave}>
                    {idSeleccionado ? "Actualizar" : "Guardar"}
                </button>
            </div>
        </div>
    </div>
  );

}
export default ModalEditAgrTs;