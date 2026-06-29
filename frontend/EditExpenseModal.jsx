import { useState, useEffect } from 'react';
import EditExpenseModal from './EditExpenseModal';
import { getExpenses, updateExpense, deleteExpense } from '../api';
import { Pencil, Trash2, TrendingUp } from 'lucide-react';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getExpenses(token);
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await updateExpense(id, updatedData, token);
      setExpenses(prev => prev.map(exp => 
        exp._id === id ? { ...exp, ...updatedData } : exp
      ));
      setShowModal(false);
    } catch (err) {
      console.error('Update error:', err);
      alert('Update failed!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const token = localStorage.getItem('token');
        await deleteExpense(id, token);
        setExpenses(prev => prev.filter(exp => exp._id !== id));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Delete failed!');
      }
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Expense Tracker</h1>
              <p className="text-slate-500 mt-1">Manage your expenses efficiently</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl">
              <p className="text-sm opacity-90">Total Spent</p>
              <p className="text-3xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No expenses yet. Start adding!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <div 
                key={expense._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-800">{expense.title}</h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">
                      {new Date(expense.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-slate-800">
                      ₹{Number(expense.amount).toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="p-2.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense._id)}
                        className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <EditExpenseModal 
            expense={editingExpense}
            onClose={() => setShowModal(false)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseList;