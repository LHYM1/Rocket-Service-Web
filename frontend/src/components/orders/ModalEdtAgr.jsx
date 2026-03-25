import { useState, useEffect } from "react";
import axios from "axios";

const ModalOrdenServicio = ({ idSeleccionado, onClose, onSuccess }) => {
  const [orden, setOrden] = useState({
    codigo_orden: "",
    id_moto: "",
    id_usuario: "",
    id_tecnico_asignado: "",
    id_tipo_servicio: "",
    id_estado_de_servicio: "",
    descripcion_del_problema: "",
    fecha_finalizacion_estimada: "",
    costo_total_final: 0
  });

  useEffect(() => {
    if (idSeleccionado) {
      setOrden({
        codigo_orden: idSeleccionado.codigo_orden,
        id_moto: idSeleccionado.id_moto,
        id_usuario: idSeleccionado.id_usuario,
        id_tecnico_asignado: idSeleccionado.id_tecnico_asignado,
        id_tipo_servicio: idSeleccionado.id_tipo_servicio,
        id_estado_de_servicio: idSeleccionado.id_estado_de_servicio,
        descripcion_del_problema: idSeleccionado.descripcion_del_problema,
        fecha_finalizacion_estimada: idSeleccionado.fecha_finalizacion_estimada,
        costo_total_final: idSeleccionado.costo_total_final,
      });
    }
  }, [idSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrden({ ...orden, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (idSeleccionado) {
        // Ruta para MODIFICAR orden
        await axios.put(
          `http://localhost:4000/api/ordenes_de_servicio/modificar/${idSeleccionado.id_orden}`,
          orden
        );
        alert("Orden actualizada con éxito");
      } else {
        // Ruta para CREAR orden
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
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg"> {/* modal-lg para que quepan los campos */}
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {idSeleccionado ? `Editar Orden: ${orden.codigo_orden}` : "Nueva Orden de Servicio"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Primera Columna */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Código Orden</label>
                <input type="text" className="form-control" name="codigo_orden" value={orden.codigo_orden} onChange={handleChange} disabled={idSeleccionado} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Técnico Asignado (ID)</label>
                <input type="number" className="form-control" name="id_tecnico_asignado" value={orden.id_tecnico_asignado} onChange={handleChange} />
              </div>

              {/* Segunda Columna */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Estado de Servicio</label>
                <select className="form-select" name="id_estado_de_servicio" value={orden.id_estado_de_servicio} onChange={handleChange}>
                  <option value="1">Recibida</option>
                  <option value="2">En Proceso</option>
                  <option value="3">Finalizada</option>
                  <option value="5">Entregada</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Costo Total</label>
                <input type="number" className="form-control" name="costo_total_final" value={orden.costo_total_final} onChange={handleChange} />
              </div>

              {/* Descripción - Ocupa todo el ancho */}
              <div className="col-12 mb-3">
                <label className="form-label">Descripción del Problema</label>
                <textarea className="form-control" name="descripcion_del_problema" rows="3" value={orden.descripcion_del_problema} onChange={handleChange}></textarea>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha Entrega Estimada</label>
                <input type="datetime-local" className="form-control" name="fecha_finalizacion_estimada" value={orden.fecha_finalizacion_estimada} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {idSeleccionado ? "Actualizar Orden" : "Crear Orden"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalOrdenServicio;