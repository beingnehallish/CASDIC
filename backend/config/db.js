// backend/config/db.js
import mysql from "mysql2";

const db = mysql.createPool({
  host: "localhost",
  user: "root",     // change if you set a MySQL password
  password: "",     // if you set a password, put it here
  database: "casdic_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database.");
    connection.release();
  }
});

export default db;
