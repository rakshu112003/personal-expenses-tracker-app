import axios from "axios";

const BASE_URL = "https://expenses-tracker-app-5.onrender.com/api";

export const getConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// LOGIN
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return res.data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};

// GET EXPENSES
export const getExpenses = async (token) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/expenses`,
      getConfig(token)
    );
    return res.data;
  } catch (err) {
    console.error("Get expenses error:", err.response?.data || err.message);
    throw err;
  }
};

// ADD EXPENSE
export const addExpense = async (expense, token) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/expenses`,
      expense,
      getConfig(token)
    );
    return res.data;
  } catch (err) {
    console.error("Add expense error:", err.response?.data || err.message);
    throw err;
  }
};

// UPDATE EXPENSE
export const updateExpense = async (id, expenseData, token) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/expenses/${id}`,
      expenseData,
      getConfig(token)
    );
    return res.data;
  } catch (err) {
    console.error("Update expense error:", err.response?.data || err.message);
    throw err;
  }
};

// DELETE EXPENSE
export const deleteExpense = async (id, token) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/expenses/${id}`,
      getConfig(token)
    );
    return res.data;
  } catch (err) {
    console.error("Delete expense error:", err.response?.data || err.message);
    throw err;
  }
};