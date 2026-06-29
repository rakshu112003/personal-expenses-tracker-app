import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    axios.get("http://localhost:5000/expenses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => setExpenses(res.data))
      .catch(err => alert("Fetch failed: " + err));
  }, [navigate]);

  const addExpense = () => {
    if (!title || !amount || !category) return alert("Fill all fields!");
    setExpenses([...expenses, { title, amount: Number(amount), category }]);
    setTitle("");
    setAmount("");
    setCategory("");
  };

  // Totals
  const totalIncome = expenses
    .filter(e => e.category.toLowerCase() === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses
    .filter(e => e.category.toLowerCase() !== "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker Dashboard</h1>
      <h3>Total Income: {totalIncome}</h3>
      <h3>Total Expenses: {totalExpenses}</h3>
      <h3>Balance: {balance}</h3>
      <hr />
      <h2>Add Expense</h2>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
      <button onClick={addExpense}>Add Expense</button>
      <hr />
      <h2>Expenses List</h2>
      {expenses.map((e, i) => (
        <div key={i}>{e.title} - ₹{e.amount} ({e.category})</div>
      ))}
    </div>
  );
}

export default Dashboard;

