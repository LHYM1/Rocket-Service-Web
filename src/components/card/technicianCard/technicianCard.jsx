import styles from './technicianCard.module.css';
import Avatar from '../../avatar/Avatar';

const TechnicianCard = ({ tecnico, asignar }) => {

    // constante estado para normalizar estados tecnicos
    const estado = tecnico.estado.toLowerCase().trim();

    // función para poner la primera letra del estado en mayúscula
    const controlar = (texto) => {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    return (
        <div className={styles.card}>
        
            {/* Avatar */}
            <Avatar 
                name={tecnico.nombre}
                size="md"
                status={tecnico.estado === "disponible" ? "online" : "offline"}
            />  

            {/* info técnico */}
            <div className={styles.info}>
                <h4 className={styles.name}>{tecnico.nombre}</h4>

                <span
                    className={`${styles.estado} ${
                        estado === "disponible" /*Operador ternario (indicar estado)*/
                            ? styles.disponible
                            : styles.ocupado
                    }`}
                >
                    {controlar(estado)}

                </span>
            </div>

            {/* Acción */}
            <button
                className={styles.btnAsignar}
                disabled={estado !== "disponible"}
                onClick={() => asignar(tecnico.id)}  
            >
                Asignar orden
            </button>

        </div>
    );
};

export default TechnicianCard;