import React, { useEffect, useState } from 'react';
import api from '../services/api';
import EditExpenseModal from './EditExpenseModal';
import ExpenseFilter from './ExpenseFilter';
import { FaEdit, FaTrash, FaSortAmountDown, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ExpenseList.css';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      toast.error('Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSort = async (field) => {
    setSortBy(field);
    try {
      const res = await api.get(`/expenses/sorted?by=${field}`);
      setExpenses(res.data);
    } catch (err) {
      toast.error('Sorting failed');
    }
  };

  return (
    <div className="expense-container" role="region" aria-label="Expense list section">
      <h2 className="expense-heading">All Expenses</h2>

      <div className="filter-wrapper">
        <ExpenseFilter onFiltered={setExpenses} />
      </div>

      <div className="sort-controls" role="group" aria-label="Sort expense list">
        <span className="sort-label">Sort by:</span>
        <button
          className="sort-btn blue"
          onClick={() => handleSort('date')}
          aria-label="Sort by date"
        >
          <FaClock /> Date
        </button>
        <button
          className="sort-btn green"
          onClick={() => handleSort('amount')}
          aria-label="Sort by amount"
        >
          <FaSortAmountDown /> Amount
        </button>
      </div>

      {loading ? (
        <div className="loading-state" aria-busy="true">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="spinner-circle" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="spinner-path" />
          </svg>
          <p>Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <p className="no-expense" role="status">No expenses found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="expense-table" aria-label="List of all recorded expenses">
            <caption className="sr-only">Expense Table</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Description</th>
                <th scope="col">Amount (₦)</th>
                <th scope="col">Category</th>
                <th scope="col">Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
                  <td>{exp.description}</td>
                  <td className="text-right">{exp.amount.toLocaleString()}</td>
                  <td>{exp.category}</td>
                  <td>{exp.date}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => setEditExpense(exp)}
                      className="edit-btn"
                      aria-label={`Edit expense with ID ${exp.id}`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="delete-btn"
                      aria-label={`Delete expense with ID ${exp.id}`}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editExpense && (
        <EditExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onUpdated={fetchExpenses}
        />
      )}
    </div>
  );
};

export default ExpenseList;
