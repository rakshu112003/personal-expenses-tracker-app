const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// CREATE EXPENSE
router.post("/", auth, async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    const newExpense = new Expense({ title, amount, category, user: req.user });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET ALL EXPENSES
// Optional query params: month=1-12, year=2026
router.get("/", auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = { user: req.user };

    if (month && year) {
      // filter by month/year
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// UPDATE EXPENSE
router.put("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: "Expense not found" });

    if (expense.user.toString() !== req.user)
      return res.status(401).json({ msg: "Not authorized" });

    const { title, amount, category } = req.body;
    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// DELETE EXPENSE
router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: "Expense not found" });

    if (expense.user.toString() !== req.user)
      return res.status(401).json({ msg: "Not authorized" });

    await expense.remove();
    res.json({ msg: "Expense removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET BALANCE + CATEGORY SUMMARY
router.get("/summary/balance", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user });

    let totalIncome = 0;
    let totalExpense = 0;
    const categorySummary = {};

    expenses.forEach((e) => {
      if (e.category.toLowerCase() === "income") {
        totalIncome += e.amount;
      } else {
        totalExpense += e.amount;
        categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.json({ totalIncome, totalExpense, balance, categorySummary });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;