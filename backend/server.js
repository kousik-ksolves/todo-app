const express = require("express");
const mysql = require("mysql2");
const util = require("util");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

/* =========================
   MySQL Configuration
========================= */
const dbConfig = {
  host: process.env.DB_HOST || "todo-mysql",
  user: process.env.DB_USER || "todo",
  password: process.env.DB_PASSWORD || "todopassword",
  database: process.env.DB_NAME || "tododb",
};

let db;
let hasLoggedWaiting = false;

/* =========================
   Helper Functions
========================= */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
   DB Connection with Retry
========================= */
async function connectWithRetry() {
  while (true) {
    try {
      db = mysql.createConnection(dbConfig);

      const connect = util.promisify(db.connect).bind(db);
      await connect();

      console.log("✅ MySQL connected");

      const query = util.promisify(db.query).bind(db);

      // Create table if not exists
      await query(`
        CREATE TABLE IF NOT EXISTS todos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          task VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT false
        )
      `);

      console.log("✅ todos table ready");
      break;
    } catch (err) {
      if (!hasLoggedWaiting) {
        console.log("⏳ Waiting for MySQL...");
        hasLoggedWaiting = true;
      }
      await sleep(3000);
    }
  }
}

/* =========================
   API Routes
========================= */

// Get all todos
app.get("/todos", async (req, res) => {
  try {
    const query = util.promisify(db.query).bind(db);
    const results = await query("SELECT * FROM todos");
    console.log("📥 Fetched todos");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add new todo
app.post("/todos", async (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: "Task is required" });

  try {
    const query = util.promisify(db.query).bind(db);
    await query("INSERT INTO todos (task) VALUES (?)", [task]);
    console.log(`➕ Todo added: ${task}`);
    res.json({ message: "Todo added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add todo" });
  }
});

// Mark todo as done / undo
app.put("/todos/:id", async (req, res) => {
  const { completed } = req.body;
  const { id } = req.params;

  try {
    const query = util.promisify(db.query).bind(db);
    await query("UPDATE todos SET completed=? WHERE id=?", [
      completed,
      id,
    ]);
    console.log(
      completed
        ? `✔️ Todo ${id} marked as done`
        : `↩️ Todo ${id} undone`
    );
    res.json({ message: "Todo updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const query = util.promisify(db.query).bind(db);
    await query("DELETE FROM todos WHERE id=?", [id]);
    console.log(`🗑️ Todo ${id} deleted`);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

/* =========================
   Start Server
========================= */
connectWithRetry().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
