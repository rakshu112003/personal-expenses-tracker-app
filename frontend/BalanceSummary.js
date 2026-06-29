import React from "react";

const BalanceSummary = ({ expenses }) => {
  const income = expenses
    .filter((e) => e.category.toLowerCase() === "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const expensesTotal = expenses
    .filter((e) => e.category.toLowerCase() !== "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = income - expensesTotal;

  return (
    <div>
      <h2>Income: ₹{income}</h2>
      <h2>Expenses: ₹{expensesTotal}</h2>
      <h2>Balance: ₹{balance}</h2>
    </div>
  );
};

export default BalanceSummary;
