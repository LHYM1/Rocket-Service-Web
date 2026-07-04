import { useState, useEffect } from "react";
import axios from "../../axiosConfig";

const ModalOrdenServicio = ({ idSeleccionado, onClose, onSuccess }) => {

    const [orden, setOrden] = useState({
    id_moto: "",
    id_usuario: "",
    id_tecnico_asignado: "",
    id_tipo_servicio: "",
    id_estado_de_servicio: "1", // ← solo agrega esto aquí
    fecha_finalizacion_estimada: "",
    descripcion_del_problema: ""
    });

    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [tiposServicio, setTiposServicio] = useState([]);
    const [estadosOrden, setEstadosOrden] = useState([]);
    const [motoCliente, setMotoCliente] = useState(null);

// Un solo useEffect que maneja todo
useEffect(() => {
    if (idSeleccionado) {
        // Al editar: técnicos sin orden + el técnico actual de esta orden
        axios.get("http://localhost:4000/api/usuarios/tecnicos-sin-orden")
            .then(res => {
                const tecnicoActual = {
                    id_usuario: idSeleccionado.id_tecnico_asignado,
                    nombre: idSeleccionado.nombre_tecnico?.split(" ")[0] || "",
                    apellido: idSeleccionado.nombre_tecnico?.split(" ")[1] || ""
                };
                // Incluir técnico actual si no está ya en la lista
                const yaIncluido = res.data.some(t => t.id_usuario === idSeleccionado.id_tecnico_asignado);
                const lista = yaIncluido ? res.data : [tecnicoActual, ...res.data];
                setTecnicos(lista);
            })
            .catch(err => console.error(err));
    } else {
        axios.get("http://localhost:4000/api/usuarios/tecnicos-sin-orden")
            .then(res => setTecnicos(res.data))
            .catch(err => console.error(err));
    }

    axios.get("http://localhost:4000/api/usuarios/clientes-con-moto")
        .then(res => setClientes(res.data))
        .catch(err => console.error(err));

    axios.get("http://localhost:4000/api/tipo_servicio/listar")
        .then(res => setTiposServicio(res.data))
        .catch(err => console.error(err));

    axios.get("http://localhost:4000/api/estado_de_orden_de_servicio/listar")
        .then(res => setEstadosOrden(res.data))
        .catch(err => console.error(err));

        
}, [idSeleccionado]);

// useEffect separado solo para precargar los datos del formulario al edita
useEffect(() => {
    if (idSeleccionado) {
        const formatFecha = (fechaISO) => {
            if (!fechaISO) return "";
            return fechaISO.substring(0, 16);
        };
        setOrden({
            id_moto: idSeleccionado.id_moto,
            id_usuario: idSeleccionado.id_usuario,
            id_tecnico_asignado: idSeleccionado.id_tecnico_asignado,
            id_tipo_servicio: idSeleccionado.id_tipo_servicio,
            id_estado_de_servicio: idSeleccionado.id_estado_de_servicio,
            fecha_finalizacion_estimada: formatFecha(idSeleccionado.fecha_finalizacion_estimada),
            descripcion_del_problema: idSeleccionado.descripcion_del_problema,
        });

        if (idSeleccionado.id_usuario) {
            axios.get(`http://localhost:4000/api/motocicleta/por-usuario/${idSeleccionado.id_usuario}`)
                .then(res => setMotoCliente(res.data))
                .catch(err => console.error(err));
        }
    }
}, [idSeleccionado]);

    // Al seleccionar cliente cargar su moto automáticamente
    const handleClienteChange = async (e) => {
        const idUsuario = e.target.value;
        setOrden({ ...orden, id_usuario: idUsuario, id_moto: "" });
        setMotoCliente(null);

        if (idUsuario) {
            try {
                const res = await axios.get(`http://localhost:4000/api/motocicleta/por-usuario/${idUsuario}`);
                setMotoCliente(res.data);
                setOrden(prev => ({ ...prev, id_usuario: idUsuario, id_moto: res.data.id_moto }));
            } catch (err) {
                console.error("Error al cargar moto:", err);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrden({ ...orden, [name]: value });
        
    };

    const handleSave = async () => {
    if (!orden.id_usuario || !orden.id_moto || !orden.id_tecnico_asignado ||
        !orden.id_estado_de_servicio) {
        alert("Todos los campos son obligatorios");
        return;
    }

        try {
            if (idSeleccionado) {
                await axios.put(
                    `http://localhost:4000/api/ordenes_de_servicio/modificar/${idSeleccionado.id_orden}`,
                    orden
                );
                alert("Orden actualizada con éxito");
            } else {
                await axios.post("http://localhost:4000/api/ordenes_de_servicio/crear", orden);
                alert("Orden creada con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar orden:", error);
            alert("Error al procesar la orden de servicio");
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content border-0 shadow-lg">

                    {/* Header */}
                    <div className="modal-header text-white" style={{ backgroundColor: "#ff8c00" }}>
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-tools me-2"></i>
                            {idSeleccionado ? `Editar Orden #${idSeleccionado.id_orden}` : "Nueva Orden de Servicio"}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="row g-3">

                            {/* Cliente */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-person me-1"></i>Cliente
                                </label>
                                <select
                                    className="form-select"
                                    name="id_usuario"
                                    value={orden.id_usuario}
                                    onChange={handleClienteChange}
                                    disabled={!!idSeleccionado}
                                >
                                    <option value="">Seleccione el cliente</option>
                                    {clientes.map(c => (
                                        <option key={c.id_usuario} value={c.id_usuario}>
                                            {c.nombre} {c.apellido}
                                        </option>
                                    ))}
                                </select>
                                {idSeleccionado && (
                                    <small className="text-muted">El cliente no se puede modificar.</small>
                                )}
                            </div>

                            {/* Moto — se carga automáticamente */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-bicycle me-1"></i>Motocicleta
                                </label>
                                {motoCliente ? (
                                    <div className="form-control bg-light">
                                        <strong>{motoCliente.placa}</strong>
                                        <span className="text-muted ms-2">— {motoCliente.nombre_modelo}</span>
                                    </div>
                                ) : (
                                    <div className="form-control bg-light text-muted">
                                        {orden.id_usuario ? "Cargando moto..." : "Seleccione un cliente primero"}
                                    </div>
                                )}
                            </div>

                            {/* Técnico */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-person-gear me-1"></i>
                                    {idSeleccionado ? "Sustituir Técnico" : "Técnico Asignado"}
                                </label>
                                {idSeleccionado && (
                                    <small className="text-muted d-block mb-1">
                                        <i className="fa-solid fa-user-check me-1"></i>
                                        Técnico actual: <strong>{idSeleccionado.nombre_tecnico}</strong>
                                    </small>
                                )}
                                <select
                                className="form-select"
                                name="id_tecnico_asignado"
                                value={orden.id_tecnico_asignado}
                                onChange={handleChange}
                                disabled={tecnicos.length === 0}
                            >
                                {tecnicos.length === 0
                                    ? <option value="">No hay técnicos disponibles</option>
                                    : <>
                                        <option value="">Seleccione un técnico</option>
                                        {tecnicos.map(t => (
                                            <option key={t.id_usuario} value={t.id_usuario}>
                                                {t.nombre} {t.apellido}
                                            </option>
                                        ))}
                                    </>
                                }
                            </select>
                            {/* Mensaje sin técnicos disponibles */}
                            {tecnicos.length === 0 && !idSeleccionado && (
                                <small className="text-danger mt-1 d-block">
                                    <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                    Todos los técnicos tienen órdenes asignadas actualmente.
                                </small>
                            )}
                            {tecnicos.length <= 1 && idSeleccionado && (
                                <small className="text-warning mt-1 d-block">
                                    <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                    No hay técnicos disponibles para sustituir a este técnico.
                                </small>
                            )}
                            </div>

                            {/* Tipo de servicio - solo en edición */}
                            {idSeleccionado && (
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-wrench me-1"></i>Tipo de Servicio
                                    </label>
                                    <select
                                        className="form-select"
                                        name="id_tipo_servicio"
                                        value={orden.id_tipo_servicio}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione el servicio</option>
                                        {tiposServicio.map(ts => (
                                            <option key={ts.id_tipo_servicio} value={ts.id_tipo_servicio}>
                                                {ts.nombre_servicio}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                           {/* Estado - solo en edición */}
                            {idSeleccionado ? (
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-flag me-1"></i>Estado
                                    </label>
                                    <select
                                        className="form-select"
                                        name="id_estado_de_servicio"
                                        value={orden.id_estado_de_servicio}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione el estado</option>
                                        {estadosOrden.map(e => (
                                            <option key={e.id_estado_de_servicio} value={e.id_estado_de_servicio}>
                                                {e.nombre_estado}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-flag me-1"></i>Estado
                                </label>
                                <div className="form-control bg-light d-flex align-items-center gap-2">
                                    {orden.id_tecnico_asignado ? (
                                        // Técnico seleccionado → mostrar ASIGNADA
                                        <>
                                            <span className="badge bg-primary px-3 py-2">ASIGNADA</span>
                                        </>
                                    ) : (
                                        // Sin técnico → mostrar mensaje
                                        <small className="text-muted">
                                            <i className="fa-solid fa-circle-info me-1" style={{ color: "#ff8c00" }}></i>
                                            Se asignará automáticamente al seleccionar un técnico
                                        </small>
                                    )}
                                </div>
                            </div>
                        )}

                            {/* Fecha */}
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-calendar me-1"></i>Fecha Entrega Estimada
                                </label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="fecha_finalizacion_estimada"
                                    value={orden.fecha_finalizacion_estimada}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Descripción - solo en edición */}
                            {idSeleccionado && (
                                <div className="col-12">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-chat-text me-1"></i>Descripción del Problema
                                    </label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion_del_problema"
                                        rows="3"
                                        placeholder="Describa el problema de la motocicleta..."
                                        value={orden.descripcion_del_problema}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            )}

                            {/* Mensaje cuando es nueva orden */}
                            {!idSeleccionado && (
                                <div className="col-12">
                                    <div className="p-3 rounded" style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107" }}>
                                        <i className="fa-solid fa-triangle-exclamation me-2" style={{ color: "#ff8c00" }}></i>
                                        <span style={{ fontSize: "0.9rem", color: "#856404" }}>
                                            El tipo de servicio y descripción del problema serán completados por el técnico durante la revisión.
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="modal-footer border-0">
                        <button className="btn btn-secondary" onClick={onClose}>
                            <i className="bi bi-x me-1"></i>Cancelar
                        </button>
                        <button className="btn text-white fw-bold" style={{ backgroundColor: "#ff8c00" }} onClick={handleSave}>
                            <i className="bi bi-check me-1"></i>
                            {idSeleccionado ? "Actualizar Orden" : "Crear Orden"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalOrdenServicio;