// src/config/connectDB.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "786lottery",
  database: "tirangasgame",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // optional: kalau kamu merasa caching statement bikin masalah
  // maxPreparedStatements: 0
});

// Helper aman: selalu pakai ini daripada pool.execute langsung
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}


// Helper transaksi + auto release
export async function transaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Kalau memang perlu satu connection manual
export async function getConnection() {
  return pool.getConnection();
}

export default pool;
