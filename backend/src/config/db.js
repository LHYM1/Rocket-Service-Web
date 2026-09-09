import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon exige conexión cifrada
    max: 10,                 // máximo de conexiones simultáneas en el pool
    idleTimeoutMillis: 30000 // mantiene una conexión abierta 30s en espera antes de cerrarla,
                              // para reutilizarla en la siguiente consulta en vez de abrir una nueva
});

let avisoImpreso = false;
pool.on('connect', () => {
    if (!avisoImpreso) {
        console.log('Base de datos conectada exitosamente (PostgreSQL / Neon)');
        avisoImpreso = true;
    }
});

pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
});

/**
 * Capa de compatibilidad: el resto del proyecto (todos los *.model.js) sigue
 * escribiendo sus consultas con '?' como marcador de posición, igual que con
 * mysql2. Esta función convierte cada '?' a '$1, $2, $3...' en el orden en que
 * aparecen.
 *
 * Importante: esto asume que ningún '?' literal aparece dentro de un valor de
 * texto de la propia consulta (por ejemplo, un LIKE '%?%'). Si eso llegara a
 * pasar en algún archivo, esa consulta puntual sí necesitaría ajustarse a mano.
 */
function convertirPlaceholders(sql) {
    let contador = 0;
    return sql.replace(/\?/g, () => `$${++contador}`);
}

const db = {
    query: async (sql, params = []) => {
        let sqlConvertido = convertirPlaceholders(sql);
        const comando = sqlConvertido.trim().split(/\s+/)[0].toUpperCase();
        const yaTieneReturning = /RETURNING/i.test(sqlConvertido);

        // PostgreSQL, a diferencia de mysql2, no devuelve el ID nuevo de un INSERT
        // por sí solo -- hay que pedirlo con RETURNING. Se agrega automáticamente
        // si la consulta no lo trae ya, para poder simular result.insertId.
        if (comando === 'INSERT' && !yaTieneReturning) {
            sqlConvertido += ' RETURNING *';
        }

        const resultado = await pool.query(sqlConvertido, params);

        if (comando === 'SELECT') {
            // Igual que mysql2: [rows, fields]
            return [resultado.rows, resultado.fields];
        }

        if (comando === 'INSERT') {
            const primeraFila = resultado.rows[0] || {};
            // Convención del proyecto: el ID autoincremental siempre es la PRIMERA
            // columna de cada tabla, por eso se toma el primer valor de la fila devuelta.
            const insertId = Object.values(primeraFila)[0];
            return [{ affectedRows: resultado.rowCount, insertId, rows: resultado.rows }, resultado.fields];
        }

        // UPDATE / DELETE: mysql2 devuelve un objeto con affectedRows, no un arreglo de filas.
        return [{ affectedRows: resultado.rowCount, rows: resultado.rows }, resultado.fields];
    }
};

export default db;