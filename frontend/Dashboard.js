import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense } from "../services/api";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Fetch all expenses from backend
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses(token);
      console.log("✅ BACKEND DATA:", data);
      setExpenses(data || []);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchExpenses();
  }, [token, navigate]);

  // ✅ Delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Delete maadana? Are you sure?")) return;
    try {
      setExpenses(prev => prev.filter(item => item._id!== id));
      await deleteExpense(id, token);
    } catch (error) {
      console.error("❌ Delete Error:", error);
      alert("Delete failed! Refresh maadi");
      fetchExpenses();
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ FLEXIBLE FILTER - Income/Salary ella consider maadutte
  const totalIncome = expenses.reduce((sum, item) => {
    const category = (item.category || "").toLowerCase().trim();
    const title = (item.title || "").toLowerCase().trim();
    // Income check: category OR title ali "income"/"salary" idre
    if (category.includes("income") || category.includes("salary") ||
        title.includes("income") || title.includes("salary")) {
      return sum + Number(item.amount || 0);
    }
    return sum;
  }, 0);

  const totalExpenses = expenses.reduce((sum, item) => {
    const category = (item.category || "").toLowerCase().trim();
    const title = (item.title || "").toLowerCase().trim();
    // Expense: income/salary alla andre ella expense
    if (!(category.includes("income") || category.includes("salary") ||
          title.includes("income") || title.includes("salary"))) {
      return sum + Number(item.amount || 0);
    }
    return sum;
  }, 0);

  const balance = totalIncome - totalExpenses;

  // ✅ Month wise filter for table
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date || expense.createdAt || Date.now());
    const expenseMonth = expenseDate.toISOString().slice(0, 7);
    return expenseMonth === filterMonth;
  });

  // ✅ Date format: 01/01/2026
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* ✅ HEADER WITH LOGOUT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>💰 Expense Tracker Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>

      {/* ✅ MONTH FILTER */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>Filter by Month: </label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
      </div>

      {/* ✅ SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", backgroundColor: "#e8f5e9", borderRadius: "8px", borderLeft: "4px solid #4caf50" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>💰 Total Income</h3>
          <h2 style={{ margin: 0, color: "#1b5e20" }}>₹{totalIncome.toLocaleString()}</h2>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#ffebee", borderRadius: "8px", borderLeft: "4px solid #f44336" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#c62828" }}>💸 Total Expenses</h3>
          <h2 style={{ margin: 0, color: "#b71c1c" }}>₹{totalExpenses.toLocaleString()}</h2>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#e3f2fd", borderRadius: "8px", borderLeft: "4px solid #2196f3" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#1565c0" }}>💵 Balance</h3>
          <h2 style={{ margin: 0, color: balance >= 0? "#0d47a1" : "#b71c1c" }}>
            ₹{balance.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ✅ TRANSACTIONS TABLE */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginTop: 0 }}>
          All Transactions - {new Date(filterMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          <span style={{ fontSize: "14px", color: "#666", marginLeft: "10px" }}>
            ({filteredExpenses.length} items)
          </span>
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Date</th>
                <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Category</th>
                <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Title</th>
                <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "right" }}>Amount</th>
                <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                    No transactions found for {filterMonth}. Add expense above!
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const category = (expense.category || "").toLowerCase();
                  const title = (expense.title || "").toLowerCase();
                  const isIncome = category.includes("income") || category.includes("salary") ||
                                  title.includes("income") || title.includes("salary");

                  return (
                    <tr key={expense._id} style={{ backgroundColor: isIncome? "#f1f8e9" : "#fff" }}>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        {formatDate(expense.date || expense.createdAt)}
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: isIncome? "#c8e6c9" : "#ffcdd2",
                          fontSize: "12px"
                        }}>
                          {expense.category || "N/A"}
                        </span>
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                        {expense.title || "N/A"}
                      </td>
                      <td style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: isIncome? "#2e7d32" : "#c62828"
                      }}>
                        {isIncome? "+" : "-"} ₹{Number(expense.amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ DEBUG INFO - Delete maadbahudu production ali */}
      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#fff3cd", border: "2px dashed orange", borderRadius: "8px" }}>
        <h4 style={{ marginTop: 0 }}>🔍 DEBUG INFO:</h4>
        <p><strong>Total Items from Backend:</strong> {expenses.length}</p>
        <p><strong>Filtered for {filterMonth}:</strong> {filteredExpenses.length}</p>
        <p><strong>First Item:</strong> {JSON.stringify(expenses[0] || "No data", null, 2)}</p>
      </div>
    </div>
  );
}

export default Dashboard;