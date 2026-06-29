import React from "react";

function ExpenseList({ expenses = [], onDelete, onEdit }) {
  return (
    <div>
      <h2>Expense List</h2>

      {expenses.length === 0 ? (
        <p>No expenses found</p>
      ) : (
        expenses.map((expense) => (
          <div
            key={expense._id}
            style={{
              margin: "10px",
              padding: "10px",
              border: "1px solid black",
            }}
          >
            <h4>{expense.title}</h4>
            <p>Amount: ₹{expense.amount}</p>
            <p>Category: {expense.category}</p>

            <button onClick={() => onEdit(expense)}>Edit</button>
            <button onClick={() => onDelete(expense._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default ExpenseList;
