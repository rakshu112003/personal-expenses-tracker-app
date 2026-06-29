import React, { useState, useEffect } from "react";
import axios from "axios";

function ExpensesForm({ fetchExpenses, selectedExpense, clearSelectedExpense }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const token = localStorage.getItem("token");

  // Fill form when editing
  useEffect(() => {
    if (selectedExpense) {
      setTitle(selectedExpense.title || "");
      setAmount(selectedExpense.amount || "");
      setCategory(selectedExpense.category || "");
    } else {
      // reset when switching back to "add mode"
      setTitle("");
      setAmount("");
      setCategory("");
    }
  }, [selectedExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title,
        amount: Number(amount), // important fix
        category,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (selectedExpense) {
        await axios.put(
          `https://expenses-tracker-app-5.onrender.com/api/expenses/${selectedExpense._id}`,
          payload,
          config
        );

        // exit edit mode
        clearSelectedExpense && clearSelectedExpense();
      } else {
        await axios.post(
          "https://expenses-tracker-app-5.onrender.com/api/expenses",
          payload,
          config
        );
      }

      setTitle("");
      setAmount("");
      setCategory("");

      fetchExpenses();
    } catch (error) {
      console.error("Expense Error:", error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{selectedExpense ? "Update Expense" : "Add Expense"}</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <button type="submit">
        {selectedExpense ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpensesForm;