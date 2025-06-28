import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaSave, FaTimes } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/EditExpenseModal.css';

const EditExpenseModal = ({ expense, onClose, onUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync form state when a new expense is passed in
  useEffect(() => {
    if (expense) {
      setForm({ ...expense });
    }
  }, [expense]);

  if (!expense || !form) return null; // Prevent render crash

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/expenses/${expense.id}`, {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success('Expense updated successfully');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h2 className="modal-title">Edit Expense</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            autoFocus
            className="modal-input"
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            className="modal-input"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <select
            className="modal-input"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="FOOD">Food</option>
            <option value="TRANSPORT">Transport</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="UTILITIES">Utilities</option>
            <option value="HEALTH">Health</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            className="modal-input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <div className="modal-buttons">
            <button type="button" className="btn cancel-btn" onClick={onClose}>
              <FaTimes /> Cancel
            </button>
            <button type="submit" className="btn save-btn" disabled={loading}>
              {loading ? (
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle
                    className="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="spinner-path"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <>
                  <FaSave /> Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
