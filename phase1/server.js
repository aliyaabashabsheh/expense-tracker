require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());

// The same columns in every query. amount::float8 turns the NUMERIC that pg
// hands back as text into a real number, and to_char keeps the date as
// YYYY-MM-DD instead of a Date object that can shift the day.
// This string is written by hand, never built from the request, so joining it
// into the SQL is safe.
const COLUMNS =
  "id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date";

// The id has to be a whole number before it reaches the query, otherwise
// PostgreSQL throws on a text like "abc".
function isValidId(id) {
  return Number.isInteger(id) && id > 0;
}

function checkExpense(data) {
  if (typeof data.title !== "string" || data.title.trim() === "") {
    return "The title is required";
  }
  if (typeof data.amount !== "number" || !Number.isFinite(data.amount) || data.amount <= 0) {
    return "The amount must be a number greater than 0";
  }
  if (!CATEGORIES.includes(data.category)) {
    return "The category must be one of: " + CATEGORIES.join(", ");
  }
  if (typeof data.date !== "string" || data.date.trim() === "") {
    return "The date is required";
  }
  return null;
}

app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT " + COLUMNS + " FROM expenses ORDER BY date, id");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query("SELECT " + COLUMNS + " FROM expenses WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/api/expenses", async (req, res) => {
  const problem = checkExpense(req.body);

  if (problem) {
    return res.status(400).json({ message: problem });
  }

  const { title, amount, category, date } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING " +
        COLUMNS,
      [title.trim(), amount, category, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Database error" });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  const problem = checkExpense(req.body);

  if (problem) {
    return res.status(400).json({ message: problem });
  }

  const { title, amount, category, date } = req.body;

  try {
    const result = await pool.query(
      "UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4 WHERE id = $5 RETURNING " +
        COLUMNS,
      [title.trim(), amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Database error" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted", id: result.rows[0].id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
