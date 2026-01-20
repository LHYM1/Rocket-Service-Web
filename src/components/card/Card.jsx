import styles from'./Card.module.css';

function Card({ title, icon, children }) {
    return (
        <div className={styles.card}>
            {icon && (
                <div className={styles.cardIcon}>
                    {icon}
                </div>
            )}

            {title && <h3 className={styles.title}>{title}</h3>}

            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
}

export default Card;