import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { useToast } from "../context/ToastContext";

function ModalCrearPreRevision({ onClose, onSuccess }) {
    const { mostrarToast } = useToast();

    const hoy = new Date().toISOString().split("T")[0]; // solo YYYY-MM-DD

    const [form, setForm] = useState({
        id_usuario: "",
        id_moto: "",
        id_tecnico_asignado: "",
        fecha_pre_revision: hoy
    });

    const [clientes, setClientes] = useState([]);
    const [motos, setMotos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);

    useEffect(() => {
        // NOTA: ajustar estas rutas si tus endpoints reales de usuarios/motocicleta tienen otro nombre
        axios.get("http://localhost:4000/api/usuarios/listar")
            .then(res => setClientes(res.data.filter(u => u.categoria_usuario === "Cliente")))
            .catch(() => mostrarToast("No se pudo cargar la lista de clientes.", "error"));

        axios.get("http://localhost:4000/api/motocicleta/listar")
            .then(res => setMotos(res.data))
            .catch(() => mostrarToast("No se pudo cargar la lista de motocicletas.", "error"));

        axios.get("http://localhost:4000/api/ordenes_de_servicio/tecnicos-disponibles")
            .then(res => setTecnicos(res.data))
            .catch(() => mostrarToast("No se pudo cargar la lista de técnicos disponibles.", "error"));

                // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const motosDelCliente = form.id_usuario
        ? motos.filter(m => String(m.id_usuario) === String(form.id_usuario))
        : motos;

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "id_usuario") {
            // #1: si el cliente tiene exactamente una moto registrada, se autoselecciona
            const motosDeEseCliente = motos.filter(m => String(m.id_usuario) === String(value));
            setForm({
                ...form,
                id_usuario: value,
                id_moto: motosDeEseCliente.length === 1 ? motosDeEseCliente[0].id_moto : ""
            });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    const handleGuardar = async () => {
        if (!form.id_usuario || !form.id_moto || !form.id_tecnico_asignado || !form.fecha_pre_revision) {
            mostrarToast("Todos los campos son obligatorios.", "warning");
            return;
        }

        try {
            await axios.post("http://localhost:4000/api/pre_revision/crear", form);
            mostrarToast("Pre-revisión creada correctamente.", "success");
            onSuccess();
            onClose();
        } catch (error) {
            const mensaje = error.response?.data?.message;
            mostrarToast(mensaje || "Hubo un error al crear la pre-revisión.", "error");
        }
    };

    return (
        <div className="rs-modal-overlay">
            <div className="rs-modal">
                <div className="rs-modal-header">
                    <div className="rs-modal-header-left">
                        <div className="rs-modal-icon">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </div>
                        <h5 className="rs-modal-title">Nueva Pre-revisión</h5>
                    </div>
                    <button type="button" className="rs-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="rs-modal-body">
                    <div className="rs-field">
                        <label className="rs-label">Cliente <span className="rs-required">*</span></label>
                        <select className="rs-input-white" name="id_usuario" value={form.id_usuario} onChange={handleChange}>
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(c => (
                                <option key={c.id_usuario} value={c.id_usuario}>{c.nombre} {c.apellido}</option>
                            ))}
                        </select>
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Motocicleta <span className="rs-required">*</span></label>

                        {!form.id_usuario ? (
                            <input
                                type="text"
                                className="rs-input-white"
                                value=""
                                placeholder="Selecciona un cliente primero"
                                disabled
                            />
                        ) : (
                            <select
                                className="rs-input-white"
                                name="id_moto"
                                value={form.id_moto}
                                onChange={handleChange}
                                disabled={motosDelCliente.length === 1}
                            >
                                <option value="">Seleccione una motocicleta</option>
                                {motosDelCliente.map(m => (
                                    <option key={m.id_moto} value={m.id_moto}>{m.placa}</option>
                                ))}
                            </select>
                        )}

                        {form.id_usuario && motosDelCliente.length === 0 && (
                            <span className="rs-hint">Este cliente no tiene motocicletas registradas.</span>
                        )}
                        {motosDelCliente.length === 1 && (
                            <span className="rs-hint">Se seleccionó automáticamente (es la única moto de este cliente).</span>
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Técnico <span className="rs-required">*</span></label>
                        <select className="rs-input-white" name="id_tecnico_asignado" value={form.id_tecnico_asignado} onChange={handleChange}>
                            <option value="">Seleccione un técnico disponible</option>
                            {tecnicos.map(t => (
                                <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
                            ))}
                        </select>
                        {tecnicos.length === 0 && (
                            <span className="rs-hint">No hay técnicos disponibles actualmente.</span>
                        )}
                    </div>

                    <div className="rs-field">
                        <label className="rs-label">Fecha de la pre-revisión</label>
                        <input
                            type="date"
                            className="rs-input-white"
                            name="fecha_pre_revision"
                            value={form.fecha_pre_revision}
                            onChange={handleChange}
                            disabled
                        />
                        <span className="rs-hint">Se registra automáticamente con la fecha de hoy.</span>
                    </div>
                </div>

                <div className="rs-modal-footer">
                    <button className="rs-btn rs-btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="rs-btn rs-btn-primary" onClick={handleGuardar}>Crear Pre-revisión</button>
                </div>
            </div>
        </div>
    );
}

export default ModalCrearPreRevision;