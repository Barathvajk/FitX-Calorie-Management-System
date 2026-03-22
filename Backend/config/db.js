const mysql = require('mysql2');
require('dotenv').config();

let poolConfig;

if (process.env.MYSQL_URL) {
  // Parse the MySQL URL manually
  const url = new URL(process.env.MYSQL_URL);
  poolConfig = {
    host:     url.hostname,
    port:     url.port || 3306,
    user:     url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
  };
} else {
  poolConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'fitx_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

const pool = mysql.createPool(poolConfig);
const db = pool.promise();

db.getConnection()
  .then(conn => { console.log('✅ MySQL connected successfully'); conn.release(); })
  .catch(err => console.error('❌ MySQL connection error:', err.message));

module.exports = db;