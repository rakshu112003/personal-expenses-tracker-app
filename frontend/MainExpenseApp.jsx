import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://expenses-tracker-app-5.onrender.com/api/expenses';

const MainExpenseApp = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', date: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

  useEffect(() => {
    if (!token) {
      showToast('Please login first', 'error');
      setTimeout(() => window.location.href = '/', 1500);
      return;
    }
    getAllExpenses();
  }, []);

  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, searchTerm, filterCategory, sortBy]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const getAllExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, config);
      setExpenses(res.data);
    } catch (err) {
      console.log('Error:', err.response?.data);
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortExpenses = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory!== 'All') {
      filtered = filtered.filter(exp => exp.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount-desc': return Number(b.amount) - Number(a.amount);
        case 'amount-asc': return Number(a.amount) - Number(b.amount);
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    setFilteredExpenses(filtered);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.title.trim()) {
      showToast('Please enter title', 'error');
      return;
    }
    if (Number(form.amount) <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }
    if (!form.date) {
      showToast('Please select date', 'error');
      return;
    }

    try {
      const data = {...form, amount: Number(form.amount) };
      
      if (editId) {
        const res = await axios.put(`${API_URL}/${editId}`, data, config);
        setExpenses(expenses.map(exp => exp._id === editId? res.data : exp));
        showToast('Expense updated successfully!', 'success');
      } else {
        const res = await axios.post(API_URL, data, config);
        setExpenses([res.data,...expenses]);
        showToast('Expense added successfully!', 'success');
      }
      
      setForm({ title: '', amount: '', category: 'Food', date: '' });
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      console.log('Save error:', err.response?.data);
      showToast('Failed: ' + (err.response?.data?.msg || 'Check console'), 'error');
    }
  };

  const handleEditClick = (exp) => {
    setEditId(exp._id);
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date.split('T')[0]
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, config);
      setExpenses(expenses.filter(exp => exp._id!== id));
      showToast('Expense deleted successfully!', 'success');
    } catch (err) {
      console.log('Delete error:', err.response?.data);
      showToast('Delete failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const total = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const monthlyTotal = expenses
    .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const getCategoryEmoji = (cat) => {
    const emojis = {
      Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '📄',
      Entertainment: '🎬', Health: '💊', Other: '📌'
    };
    return emojis[cat] || '📌';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Food: '#FF6B6B', Transport: '#4ECDC4', Shopping: '#FFE66D',
      Bills: '#95E1D3', Entertainment: '#A8E6CF', Health: '#FF8B94', Other: '#C7CEEA'
    };
    return colors[cat] || '#C7CEEA';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f7fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '60px', border: '4px solid #e0e0e0',
            borderTop: '4px solid #667eea', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }}></div>
          <h3 style={{ color: '#667eea' }}>Loading your expenses...</h3>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          background: toast.type === 'success'? '#4CAF50' : '#f44336',
          color: 'white', padding: '16px 24px', borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease'
        }}>
          {toast.message}
          <style>{`@keyframes slideIn { from { transform: translateX(400px); } to { transform: translateX(0); } }`}</style>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', padding: '40px', borderRadius: '20px', marginBottom: '25px',
        boxShadow: '0 10px 40px rgba(102,126,234,0.3)', position: 'relative'
      }}>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute', top: '20px', right: '20px', padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}
        >
          Logout
        </button>
        <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>💰 My Expense Tracker</h1>
        <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Expenses</p>
            <h2 style={{ margin: '8px 0 0 0', fontSize: '32px' }}>₹{total.toLocaleString('en-IN')}</h2>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>This Month</p>
            <h2 style={{ margin: '8px 0 0 0', fontSize: '32px' }}>₹{monthlyTotal.toLocaleString('en-IN')}</h2>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Items</p>
            <h2 style={{ margin: '8px 0 0 0', fontSize: '32px' }}>{filteredExpenses.length}</h2>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', amount: '', category: 'Food', date: '' }); }}
          style={{
            padding: '14px 35px', background: 'white', color: '#667eea', border: 'none',
            borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
            marginTop: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          {showForm? '✕ Close Form' : '+ Add New Expense'}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', gap: '12px', flexWrap: 'wrap'
      }}>
        <input
          style={{ flex: '1 1 200px', padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '15px' }}
          placeholder="🔍 Search by title or category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '15px', cursor: 'pointer' }}
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'All'? '📊 All Categories' : getCategoryEmoji(cat) + ' ' + cat}</option>)}
        </select>
        <select
          style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '15px', cursor: 'pointer' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date-desc">📅 Latest First</option>
          <option value="date-asc">📅 Oldest First</option>
          <option value="amount-desc">💰 Highest Amount</option>
          <option value="amount-asc">💰 Lowest Amount</option>
          <option value="title">🔤 A-Z</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '3px solid #667eea'
        }}>
          <h3 style={{ marginTop: 0, color: '#667eea', fontSize: '24px' }}>{editId? '✏️ Edit Expense' : '➕ Add New Expense'}</h3>
          <form onSubmit={handleSave}>
            <input
              style={{ width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '16px', boxSizing: 'border-box' }}
              placeholder="Title (e.g., Grocery, Petrol, Movie)"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value })}
              required
            />
            <input
              style={{ width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '16px', boxSizing: 'border-box' }}
              type="number"
              step="0.01"
              placeholder="Amount (₹)"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value })}
              required
            />
            <select
              style={{ width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '16px', boxSizing: 'border-box', cursor: 'pointer' }}
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value })}
            >
              {categories.filter(c => c!== 'All').map(cat => <option key={cat} value={cat}>{getCategoryEmoji(cat)} {cat}</option>)}
            </select>
            <input
              style={{ width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '16px', boxSizing: 'border-box' }}
              type="date"
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" style={{
                flex: 1, padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '17px', boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
              }}>
                {editId? '✓ Update Expense' : '✓ Save Expense'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} style={{
                padding: '16px 30px', background: '#e0e0e0', color: '#333', border: 'none',
                borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '17px'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense List */}
      {filteredExpenses.length === 0? (
        <div style={{ background: 'white', padding: '60px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📊</div>
          <h3 style={{ color: '#999', margin: '0 0 10px 0' }}>
            {searchTerm || filterCategory!== 'All'? 'No expenses match your filters' : 'No expenses yet'}
          </h3>
          <p style={{ color: '#bbb', margin: 0 }}>
            {searchTerm || filterCategory!== 'All'? 'Try changing search or filter' : 'Click "Add New Expense" to get started!'}
          </p>
        </div>
      ) : (
        filteredExpenses.map(exp => (
          <div key={exp._id} style={{
            background: 'white', padding: '22px', marginBottom: '14px', borderRadius: '15px',
            boxShadow: '0 3px 12px rgba(0,0,0,0.08)', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s',
            borderLeft: `5px solid ${getCategoryColor(exp.category)}`
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.08)'; }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{getCategoryEmoji(exp.category)}</span>
                <h3 style={{ margin: 0, color: '#333', fontSize: '19px', fontWeight: '700' }}>{exp.title}</h3>
              </div>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: getCategoryColor(exp.category), color: 'white', padding: '4px 12px',
                  borderRadius: '6px', fontSize: '12px', fontWeight: '600'
                }}>
                  {exp.category}
                </span>
                <span>•</span>
                <span>{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <h3 style={{ margin: 0, color: '#667eea', fontSize: '26px', fontWeight: '800' }}>
                ₹{Number(exp.amount).toLocaleString('en-IN')}
              </h3>
              <button
                onClick={() => handleEditClick(exp)}
                style={{ padding: '10px 20px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(exp._id)}
                style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MainExpenseApp;