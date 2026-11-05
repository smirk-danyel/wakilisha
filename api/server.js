const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "wakilisha-api" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Wakilisha API running on http://localhost:${PORT}`);
});
