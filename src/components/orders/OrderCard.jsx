import styles from './OrderCard.module.css';

const OrderCard = ({ order, activa, onSelect }) => {

    const estadosClases = {
        pendiente: "pendiente",
        "en proceso": "enProceso",
        finalizada: "finalizada",
        cancelada: "cancelada",
        asignada: "asignada"
    };

    // Constante estadoOrden para normalizar estados de ordenes
    const estadoOrden = order.estado.toLowerCase().trim();

    // Función para poner la primera letra del estado de la orden en mayúscula
    const controlarEstado = (texto) => {
        return texto.charAt(0).toUpperCase() +
        texto.slice(1);
    }

    return (
        <div 
            className={`${styles.card} ${activa ? styles.activa : ""}`}
            onClick={onSelect} //Si el user hace click ejecuta función onSelect
        >

            <div className={styles.header}>
                <h4>{order.codigo}</h4>
            </div>

            <div className={styles.cliente}>
                <p><b>Cliente:</b> {order.cliente}</p>

                <span
                    className={`${styles.estado} ${
                        styles[estadosClases[estadoOrden]] || styles.pendiente
                    }`}
                >
                    {controlarEstado(estadoOrden)}
                </span>
            </div>
            
            <p><b>Servicio:</b> {order.servicio}</p>

            <p className={styles.descripcion}>
                {order.descripcion}
            </p>
                
            {/* Letra pequeña para fecha de inicio orden */}
            <small className={styles.fecha}>
                Fecha inicio: {order.fechaInicio}
            </small>

        </div> 
    );
}; 

export default OrderCard;