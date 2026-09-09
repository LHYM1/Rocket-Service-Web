import { useState, useEffect } from "react";
import axios from "axios";

const CategoriaEditAgr = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ categoria, setCategoria ] = useState({
        nombre: "",
        descripcion: ""
    });

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setCategoria({
                nombre: idSeleccionado.nombre,
                descripcion: idSeleccionado.descripcion, 
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria({...categoria, [name]: value });
    }

    const handleSave = async () => {
        try {
            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/categoria/modificar/${idSeleccionado.id_categoria }`, categoria
                );
                alert("Categoria insumo actualizada con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/categoria/crear`, categoria
                );

                alert("Categoria insumo agregada con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el registro");
        }
    };

    return (
        <div className="modal d-block">
            <div className="modal-dialog">
                
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {idSeleccionado ? "Editar categoria" : "Registrar categoria"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Ingrese el nombre de la categoria</label>

                            <input
                                type="text"
                                className="form-control"
                                name="nombre"
                                value={categoria.nombre }
                                onChange={handleChange}
                            />
                        </div>

                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Escriba una descripción</label>

                                <textarea
                                    id="comentarios"
                                    className="form-control"
                                    placeholder="Descripción opcional..."
                                    name="descripcion"
                                    rows="4" 
                                    cols="50"
                                    value={categoria.descripcion }
                                    onChange={handleChange}
                                />
                            </div>

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
export default CategoriaEditAgr;