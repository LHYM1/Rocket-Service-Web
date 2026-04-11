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
    //fecha_de_creacion: "",
    fecha_finalizacion_estimada: "",
    descripcion_del_problema: ""
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
        fecha_de_creacion: idSeleccionado.fecha_de_creacion,
        fecha_finalizacion_estimada: idSeleccionado.fecha_finalizacion_estimada,
        descripcion_del_problema: idSeleccionado.descripcion_del_problema,
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
                <input type="text" className="form-control" name="codigo_orden" value={orden.codigo_orden} onChange={handleChange} />

              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Placa Moto</label>

              <select
                  className="form-control"
                  name="id_moto" // Este es el nombre que recibirá el ID
                  value={orden.id_moto}
                  onChange={handleChange}
                >

                  <option value="">Seleccione la placa</option>
                  <option value="1">M001</option>
                  <option value="2">M002</option>
                  <option value="3">M003</option>
                  <option value="4">M004</option>
                  <option value="5">M005</option>
                  <option value="6">M006</option>
                  <option value="7">M007</option>
                  <option value="8">M008</option>
                  <option value="9">M009</option>
                  <option value="10">M010</option>
                  <option value="11">M011</option>
                </select>
              </div>

              {/* usuarios */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Usuarios</label>

                <select
                    className="form-control"
                    name="id_usuario" // Este es el nombre que recibirá el ID
                    value={orden.id_usuario}
                    onChange={handleChange}
                  >

                    <option value="">Seleccione el usuario</option>
                    <option value="1">Juan Pérez</option>
                    <option value="2">Carlos Castañeda</option>
                    <option value="3">Luis Suarez</option>
                    <option value="4">Andrés Órtiz</option>
                    <option value="5">Juan Cortez</option>
                    <option value="6">Miguel Valencia</option>
                    <option value="7">Felipe Ruiz</option>
                    <option value="8">Camilo Sánchez</option>
                    <option value="9">Armando Espinoza</option>
                    <option value="10">José Garcia</option>
                    <option value="11">Alberto Huertas</option>
                    <option value="12">Tomas Alba</option>
                    <option value="13">Nicolas Benitez</option>
                    <option value="14">Juan Vargas</option>
                    <option value="16">Carlos Perez</option>
                    <option value="19">Juan Huertas</option>
                    <option value="20">Nicolas Florez</option>
                    <option value="21">Kevin Vargas</option>
                    <option value="22">Juan Pérez</option>
                  </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Técnico Asignado</label>

                <select
                    className="form-control"
                    name="id_tecnico_asignado" // Este es el nombre que recibirá el ID
                    value={orden.id_tecnico_asignado}
                    onChange={handleChange}
                >

                  <option value="">
                    <option value="5">Juan Cortez</option>
                    <option value="6">Miguel Valencia</option>
                    <option value="7">Felipe Ruiz</option>
                    <option value="8">Camilo Sánchez</option>
                    <option value="13">Nicolas Benitez</option>
                    <option value="22">Juan Pérez</option>
                  </option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Tipo de servicio</label>

                <select
                  className="form-control"
                  name="id_tipo_servicio " // Este es el nombre que recibirá el ID
                  value={orden.id_tipo_servicio}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un tipo de servicio</option>
                  <option value="1">Mantenimiento preventivo</option>
                  <option value="2">Diagnóstico</option>
                  <option value="3">Reparación</option>
                  <option value="4">Ajuste de Válvulas y Carburación</option>
                  <option value="5">Diagnóstico y Reparación de Suspensión</option>
                  <option value="6">Mantenimiento del Sistema de Frenos</option>
                  <option value="7">Revisión y carga de batería</option>
                  <option value="8">Instalación de Sistemas de Escape</option>
                  <option value="9">Alineación y Balanceo de Ruedas</option>
                  <option value="10">Limpieza Ultrasónica de Componentes</option>
                  <option value="13">mantenimiento</option>
                </select>
              </div>

              {/* Segunda Columna */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Estado de Servicio</label>
                <select className="form-select" name="id_estado_de_servicio" value={orden.id_estado_de_servicio} onChange={handleChange}>
                  <option value="">Seleccione un estado...</option>
                  <option value="1">ASIGNADA</option>
                  <option value="2">PENDIENTE</option>
                  <option value="3">FINALIZADA</option>
                  <option value="4">CANCELADA</option>
                  <option value="5">EN PROCESO</option>
                  <option value="6">EN ESPERA</option>
                  <option value="7">RECHAZADA</option>
                  <option value="8">EN REVISIÓN</option>
                  <option value="9">APROBADA</option>
                  <option value="10">FACTURADA</option>
                </select>
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