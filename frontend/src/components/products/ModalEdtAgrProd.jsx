import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ insumo, setInsumo ] = useState({
        codigo_insumo: "",
        id_categoria : "",
        id_unidad : "",
        nombre_insumo: "",
        precio_base: ""
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setInsumo({
                codigo_insumo: idSeleccionado.codigo_insumo,
                id_categoria: idSeleccionado.id_categoria, 
                id_unidad: idSeleccionado.id_unidad,
                nombre_insumo: idSeleccionado.nombre_insumo,
                precio_base: idSeleccionado.precio_base
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInsumo({...insumo, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/insumos/modificar/${idSeleccionado.id_insumo  }`, insumo
                );
                alert("Insumo actualizado con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/insumos/crear`, insumo
                );

                alert("insumo agregado con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el insumo");
        }
    };

    return (
    <div className="modal d-block">
        <div className="modal-dialog">
            
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">
                        {idSeleccionado ? "Editar Insumo" : "Registrar Insumo"}
                    </h5>

                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                <div className="modal-body">
                    <div className="mb-3">
                        <label className="form-label">Código Insumo</label>

                        <input
                            type="text"
                            className="form-control"
                            name="codigo_insumo"
                            value={insumo.codigo_insumo}
                            onChange={handleChange}
                        />
                    </div>

                    { /* Seleccionar categoria tabla categoria  */ }
                    <div className="mb-3">
                        <label className="form-label">Categoria</label>
                        <select 
                            className="form-select" 
                            name="id_categoria" 
                            value={insumo.id_categoria} 
                            onChange={handleChange} 
                            required
                        >

                            {/* Seleccionar técnico */}
                            <option value="">Seleccione una categoria</option>
                            {insumo.map((ins) => (
                                <option key={ins.id_categoria} value={ins.id_categoria}>
                                 {ins.nombre} 
                                </option>
                                
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Unidad de medida</label>
                        <select 
                            className="form-select" 
                            name="id_unidad" 
                            value={insumo.id_unidad } 
                            onChange={handleChange} 
                            required
                        >

                            {/* Seleccionar */}
                            <option value="">Seleccione una unidad de medida</option>
                            {insumo.map((ins) => (
                                <option key={ins.id_unidad} value={ins.id_unidad}>
                                 {ins.nombre} {ins.simbolo} 
                                </option>
                                
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Insumo</label>
                        <input
                            type="text"
                            className="form-control"
                            name="nombre_insumo"
                            value={insumo.nombre_insumo}
                            onChange={handleChange}
                        />
                    </div>

                     <div className="mb-3">
                        <label className="form-label">Precio base</label>
                        <input
                            type="text"
                            className="form-control"
                            name="nombre_insumo"
                            value={insumo.precio_base}
                            onChange={handleChange}
                        />
                    </div>

                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                    Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                    {idSeleccionado ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

}
export default ModalEditAgrTs;