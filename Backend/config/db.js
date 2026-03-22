const mysql = require('mysql2');
require('dotenv').config();

let pool;

if (process.env.MYSQL_URL) {
  // Railway Production — use full connection URL
  pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Local Development
  pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'fitx_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

const db = pool.promise();

db.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => console.error('❌ MySQL connection error:', err.message));

module.exports = db;