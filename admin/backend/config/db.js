import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('PostgreSQL Database Connected Successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL Database Error', err);
    process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;