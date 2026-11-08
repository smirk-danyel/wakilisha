require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Basic API health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "wakilisha-api",
  });
});

// Database connection health check
app.get("/health/db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS db_name");

    res.json({
      status: "ok",
      database: rows[0].db_name,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Wakilisha API running on http://localhost:${PORT}`);
});
