import mysql from "mysql2/promise";

// One pool per server process (survives Next.js hot reloads in dev).
const g = globalThis;
export const pool =
  g.__stagehandPool ??
  (g.__stagehandPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "concert_deployment_db",
    waitForConnections: true,
    connectionLimit: 10,
    // Return DATE/DATETIME as plain strings so timezones never shift them.
    dateStrings: true,
  }));

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Runs fn(connection) inside a transaction: commit on success, rollback on any error.
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
