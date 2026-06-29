const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Root test
app.get("/", (req, res) => res.send("Server is running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`));
