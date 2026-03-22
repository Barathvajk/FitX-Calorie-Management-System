const mysql = require('mysql2');
require('dotenv').config();

console.log('MYSQL_URL exists:', !!process.env.MYSQL_URL);
console.log('MYSQL_URL preview:', process.env.MYSQL_URL?.substring(0, 30));

let poolConfig;

if (process.env.MYSQL_URL) {
  const url = new URL(process.env.MYSQL_URL);
  console.log('Parsed host:', url.hostname);
  console.log('Parsed port:', url.port);
  console.log('Parsed user:', url.username);
  console.log('Parsed db:', url.pathname.replace('/', ''));
  poolConfig = {
    host:     url.hostname,
    port:     Number(url.port) || 3306,
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