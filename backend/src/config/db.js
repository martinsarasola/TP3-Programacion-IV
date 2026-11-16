import 'dotenv/config';
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    const port = Number(DB_PORT || 3306);
    if (!DB_USER || !DB_NAME || DB_PASSWORD === undefined || !Number.isInteger(port) || port < 1 || port > 65535) {
      const error = new Error('MySQL configuration is incomplete or invalid');
      error.code = 'DB_CONFIG_INVALID';
      throw error;
    }
    pool = mysql.createPool({
      host: DB_HOST || '127.0.0.1',
      port,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      dateStrings: true,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}
