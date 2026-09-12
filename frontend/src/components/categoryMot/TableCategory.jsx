import { useState } from "react";
import axios from '../../axiosConfig';
import { useToast } from "../../context/ToastContext";
import ConfirmModal from '../ConfirmModal';

function TableCategory({ categoria, setIdSeleccionado, getCategoria }) {
    const { mostrarToast } = useToast();
    const [categoriaParaEliminar, setCategoriaParaEliminar] = useState(null);

    if (!categoria || !Array.isArray(categoria)) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-tags rs-empty-icon"></i>
                <p className="rs-empty-text">No hay categorías disponibles.</p>
            </div>
        );
    }

    if (categoria.length === 0) {
        return (
            <div className="rs-empty">
                <i className="fa-solid fa-magnifying-glass rs-empty-icon"></i>
                <p className="rs-empty-text">No se encontraron categorías.</p>
            </div>
        );
    }

    const eliminarCatg = (id) => {
        setCategoriaParaEliminar(id);
    };

    const confirmarEliminar = () => {
        const id = categoriaParaEliminar;
        setCategoriaParaEliminar(null);
        axios.delete(`/api/categoria/eliminar/${id}`)
            .then(() => {
                mostrarToast("Categoría eliminada con éxito.", "success");
                getCategoria();
            })
            .catch(err => {
                mostrarToast(err.response?.data?.message || "No se pudo eliminar la categoría.", "error");
            });
    };

    return (
        <>
            <div className="rs-table-wrapper">
                <table className="rs-table rs-table-sm">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoria.map((cat) => (
                            <tr key={cat.id_categoria}>
                                <td style={{ color: '#1a1a2e', fontWeight: '500' }}>{cat.nombre}</td>
                                <td>{cat.descripcion || <span className="rs-hint">Sin descripción</span>}</td>
                                <td>
                                    <div className="rs-actions">
                                        <button
                                            onClick={() => setIdSeleccionado(cat)}
                                            className="rs-btn rs-btn-icon rs-btn-edit"
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            onClick={() => eliminarCatg(cat.id_categoria)}
                                            className="rs-btn rs-btn-icon rs-btn-delete"
                                            title="Eliminar"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {categoriaParaEliminar && (
                <ConfirmModal
                    title="¿Eliminar esta categoría?"
                    message="Esta acción no se puede deshacer. Si hay insumos usando esta categoría, no se podrá eliminar."
                    confirmLabel="Sí, eliminar"
                    icon="fa-solid fa-trash"
                    onConfirm={confirmarEliminar}
                    onCancel={() => setCategoriaParaEliminar(null)}
                />
            )}
        </>
    );
}

export default TableCategory;