const express = require("express");
const cors = require("cors");
const db = require("./db");
const uploadRoutes = require("./routes/uploadRoutes");
const app = express();
const forecastRoutes = require("./routes/forecastRoutes");


app.use("/api", forecastRoutes);

app.use("/api", uploadRoutes);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/test-db", async (req, res) => {
  try {
    const connection = await db.getConnection();
    connection.release();
    res.json({ message: "Database connected ✅" });
  } catch (error) {
    res.status(500).json({ error: "Database connection failed ❌" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
