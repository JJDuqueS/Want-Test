import { createPool } from 'mysql2/promise';

function poolConnect() {
    try {

        const pool = createPool({
            waitForConnections: true,
            connectionLimit: 30,
            idleTimeout: 5000,
            queueLimit: 0,
            connectTimeout: 30000,
            user: process.env.DB_USER_MYSQL,
            password: process.env.DB_PASS_MYSQL,
            host: process.env.DB_HOST_MYSQL,
            database: process.env.DB_NAME_MYSQL,
            port: process.env.DB_PORT_MYSQL,
            charset:'utf8mb4'
        });

        pool.on('error', (err) => {
            console.error('Error en el pool de conexiones', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log('Intentando reconectar...');
                poolConnect();
            }
        });

        console.log(`Pool conexión para BD '${process.env.DB_NAME_MYSQL}' en el host '${process.env.DB_HOST_MYSQL}:${process.env.DB_PORT_MYSQL}'.`);

        return pool;

    } catch (error) {
        console.error(`Error al crear el Pool de conexiones para la base de datos ${process.env.DB_NAME_MYSQL}: ${error}`);
    };
};

const pool = poolConnect();
export { pool };