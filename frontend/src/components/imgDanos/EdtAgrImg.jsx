import { useState, useEffect } from "react";
import axios from "axios";

const ModalEditAgrTs = ({ idSeleccionado, onClose, onSuccess }) => {
    const [ imgDanos, setImgDanos ] = useState({
        id_orden: "",
        descripcion: "",
        url_imagen: ""
    });

    // Estado para captura de input
    const [file, setFile] = useState(null);

    // useEffect para precargar datos de DB si hay un idSeleccionado
    useEffect(() => {
        if (idSeleccionado) {
            setImgDanos({
                id_orden: idSeleccionado.id_orden,
                descripcion: idSeleccionado.descripcion, 
                url_imagen: idSeleccionado.url_imagen
            })
        }
    }, [idSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setImgDanos({...imgDanos, [name]: value });
    }

    const handleSave = async () => {
        try {
            // declaración variable dataToSend para enviar la imagen
            const dataToSend = new FormData(); // form data (contenedor de datos en lugar de json)

            if (idSeleccionado) {
                dataToSend.append("id_imagen", idSeleccionado.id_imagen);
            }

            dataToSend.append("id_orden", imgDanos.id_orden);
            dataToSend.append("descripcion", imgDanos.descripcion);

            if (file) {
            dataToSend.append("url_imagen", file); // El backend lo recibe para subir a Cloudinary

        }

            if (idSeleccionado) {
                // Editar
                await axios.put(
                    `http://localhost:4000/api/imagenes_danos/modificar/${idSeleccionado.id_imagen }`, dataToSend, // Enviamos el FormData
                    { headers: { 'Content-Type': 'multipart/form-data' } } // Configuración necesaria
                );
                alert("Imagen de daño actualizada con éxito");
            } else {
                // Agregar
                await axios.post(
                    `http://localhost:4000/api/imagenes_danos/crear`,
                    dataToSend, // Enviamos el FormData
                    { headers: { 'Content-Type': 'multipart/form-data' } } // Configuración necesaria
                );

                alert("Imagen de daño agregada con éxito");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al guardar:", error);

            // Si el servidor responde con un mensaje específico, lo mostramos
            const mensajeError = error.response?.data?.message || "Hubo un error al guardar";
            alert(mensajeError);
        }
    };

    return (
        <div className="modal d-block">
            <div className="modal-dialog">
                
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {idSeleccionado ? "Editar imagen de daño" : "Registrar imagen de daño"}
                        </h5>

                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Orden</label>
                                <select
                                    className="form-control"
                                    name="id_orden" // Este es el nombre que recibirá el ID
                                    value={imgDanos.id_orden}
                                    onChange={handleChange}
                                >
                                    <option value=""></option>
                                    <option value="1">ORD-001</option>
                                    <option value="2">ORD-002</option>
                                    <option value="3">ORD-003</option>
                                    <option value="4">ORD-004</option>
                                    <option value="5">ORD-005</option>
                                    <option value="6">ORD-006</option>
                                    <option value="7">ORD-007</option>
                                    <option value="8">ORD-008</option>
                                    <option value="9">ORD-009</option>
                                    <option value="10">ORD-010</option>
                                </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Descripción</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="descripcion" 
                                    value={imgDanos.descripcion}
                                    onChange={handleChange}
                                />        
                        </div>

                       <div className="mb-3">
                            <label className="form-label">Imagen</label>

                            {/* Vista previa de la imagen actual (Solo en edición) */}
                            {idSeleccionado && idSeleccionado.url_imagen && (
                                <div className="mb-2">
                                    <p className="text-muted small">Imagen actual:</p>
                                  
                                    <img 
                                        src={`http://localhost:4000${idSeleccionado.url_imagen}`} 
                                        alt="Vista previa" 
                                        style={{ 
                                            width: '100%', 
                                            maxHeight: '150px', 
                                            objectFit: 'contain'
                                        }} 
                                    />
                                </div>
                            )}

                            {/* Input para subir una NUEVA imagen */}
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            {idSeleccionado && (
                                <div className="form-text">
                                    Deja este campo vacío si no deseas cambiar la imagen actual.
                                </div>
                            )}
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