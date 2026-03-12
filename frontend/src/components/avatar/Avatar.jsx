import styles from './Avatar.module.css';

const Avatar = ({ name, src, size="md", status }) => {

    const getInitials = (name) => {
        if (!name) return ""; /* Evita errores si no llega el nombre */

        const words = name.trim().split(" "); /* Separa el nombre */

        const firtsInitial = words[0]?.charAt(0) || ""; /* Primera letra del primer nombre */ 
        const lastInitial = words.length > 1
            ? words[words.length - 1].charAt(0) /* Primera letra del último nombre */
            : "";

        return (firtsInitial + lastInitial).toUpperCase();
    };
 
    /* Función para colocar img o avatar */
    const initials = getInitials(name);

    return (
        <div className={`${styles.avatar} ${styles[size]} ${styles[status]}`}>
            {src ? (
                <img src={src} alt={name} />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}

export default Avatar;