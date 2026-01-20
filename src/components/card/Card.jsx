import styles from'./Card.module.css';

function Card({ title, children, className = '' }) {
    return (
        <div className={`${styles.card} ${className}`}>
            { title && <h3 className={styles.title}>{title}</h3> }
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
}

export default Card;