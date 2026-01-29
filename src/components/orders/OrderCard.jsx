import styles from './OrderCard.module.css';

const OrderCard = ({ order, activa, onSelect }) => {
    return (
        <div 
            className={`${styles.card} ${activa ? styles.activa : ""}`}
            onClick={onSelect} //Si el user hace click ejecuta función onSelect
        >

            <div className={styles.header}>
                <h4>{order.codigo}</h4>
                <span className={styles.estado}>{order.estado}</span>
            </div>

            <p><b>Cliente:</b> {order.cliente}</p>
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