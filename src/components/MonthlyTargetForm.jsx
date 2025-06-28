import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const MonthlyTargetForm = () => {
  const [month, setMonth] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  // Inject style on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .target-form {
        margin: 2rem auto;
        padding: 1.5rem;
        max-width: 500px;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .target-form h2 {
        text-align: center;
        margin-bottom: 1rem;
        color: #1f2937;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      .form-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.3rem;
        color: #333;
      }
      .form-group input,
      .form-group select {
        width: 100%;
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 1rem;
      }
      .submit-btn {
        background-color: #4f46e5;
        color: #fff;
        padding: 0.6rem 1rem;
        border: none;
        border-radius: 6px;
        width: 100%;
        cursor: pointer;
        font-weight: bold;
        font-size: 1rem;
        transition: background-color 0.3s ease;
      }
      .submit-btn:hover {
        background-color: #4338ca;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month || !category || !amount) {
      toast.error('All fields are required');
      return;
    }

    try {
      await api.post('/targets', {
        month,
        category,
        targetAmount: parseFloat(amount),
      });
      toast.success('Monthly target set successfully!');
      setMonth('');
      setCategory('');
      setAmount('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to set target');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="target-form">
      <h2>Set Monthly Target</h2>

      <div className="form-group">
        <label htmlFor="month">Month</label>
        <input
          type="month"
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select</option>
          <option value="FOOD">Food</option>
          <option value="TRANSPORT">Transport</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="UTILITIES">Utilities</option>
          <option value="HEALTH">Health</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Target Amount (₦)</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10000"
        />
      </div>

      <button type="submit" className="submit-btn">
        Save Target
      </button>
    </form>
  );
};

export default MonthlyTargetForm;
