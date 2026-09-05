import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rock-service',
    port: 3306,
    charset: 'utf8mb4_general_ci',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Refuerzo: fuerza explícitamente la codificación UTF-8 en cada conexión nueva del pool.
// Esto es más confiable que solo la opción "charset" en algunas versiones de mysql2.
pool.on('connection', (connection) => {
    connection.query("SET NAMES utf8mb4", (err) => {
        if (err) console.error("Error al fijar SET NAMES utf8mb4:", err);
    });
});

export default pool;