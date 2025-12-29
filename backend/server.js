const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Enable CORS for frontend (localhost:3000)
app.use(cors());

// ✅ Parse JSON body
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  }
  console.log("✅ MySQL connected");
});

// ✅ GET /todos → fetch all todos
app.get("/todos", (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ POST /todos → add new todo
app.post("/todos", (req, res) => {
  console.log("📥 Request body:", req.body);

  const { task } = req.body;

  if (!task) {
    console.log("❌ No task received");
    return res.status(400).json({ error: "Task is required" });
  }

  db.query(
    "INSERT INTO todos (task) VALUES (?)",
    [task],
    (err, result) => {
      if (err) {
        console.error("❌ DB error:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("✅ Inserted:", result.insertId);
      res.json({ id: result.insertId, task });
    }
  );
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
