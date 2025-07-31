// db.js
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '786lottery',
  database: 'tirangasgame'
});
conn.connect(err => { if (err) throw err; });
module.exports = conn;
