import styles from'./Card.module.css';

function Card({ title, icon, children }) {
    return (
        <div className={styles.card}>
            {title && <h3 className={styles.title}>{title}</h3>}

            {icon && (
                <div className={styles.cardIcon}>
                    {icon}
                </div>
            )}

            <h2 className={styles.counter}>
                {children}
            </h2>

        </div>
    );
}

export default Card;