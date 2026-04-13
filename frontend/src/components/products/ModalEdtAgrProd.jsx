import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ insumo, setInsumo ] = useState({
        id_categoria : "",
        id_unidad : "",
        nombre_insumo: "",
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
            })
        }
    }, [idSeleccionado]);

    // useEffect para cargar categorias y unidades
    useEffect(() => {
        const fetchData = async () => {
            const categoria = await axios.get("http://localhost:4000/api/categoria/listar");
            setCategorias(categoria.data);

            const unidad = await axios.get("http://localhost:4000/api/unidad_de_medida/listar");
            setUnidades(unidad.data);
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInsumo({...insumo, [name]: value });
    }


    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/insumos/modificar/${idSeleccionado.id_insumo}`, insumo
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
            console.error("Detalle del error:", error.response ? error.response.data : error.message);
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

                            {/* Seleccionar categoria */}
                            <option value="">Seleccione una categoria</option>
                            {categorias.map((cat) => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                 {cat.nombre} 
                                </option>
                                
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Unidad de medida</label>
                        <select 
                            className="form-select" 
                            name="id_unidad" 
                            value={insumo.id_unidad} 
                            onChange={handleChange} 
                            required
                        >

                            {/* Seleccionar */}
                            <option value="">Seleccione una unidad de medida</option>
                            {unidades.map((ins) => (
                                <option key={ins.id_unidad} value={ins.id_unidad}>
                                 {ins.nombre}
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