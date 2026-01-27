import styles from './technicianCard.module.css';
import Avatar from '../../avatar/Avatar';

const TechnicianCard = ({ tecnico, asignar }) => {
    return (
        <div className={styles.card}>
        
            {/* Avatar */}
            <Avatar 
                name={tecnico.nombre}
                size="md"
                status={tecnico.estado === "Disponible" ? "online" : "offline"}
            />  

            {/* info técnico */}
            <div className={styles.info}>
                <h4 className={styles.name}>{tecnico.nombre}</h4>

                <span
                    className={`${styles.estado} ${
                        tecnico.estado === "Disponible" /*Operador ternario (indicar estado)*/
                            ? styles.disponible
                            : styles.ocupado
                    }`}
                >
                    {tecnico.estado}

                </span>
            </div>

            {/* Acción */}
            <button
                className={styles.btnAsignar}
                disabled={tecnico.estado !== "Disponible"}
                onClick={() => asignar(tecnico.id)}  
            >
                Asignar orden
            </button>

        </div>
    );
};

export default TechnicianCard;