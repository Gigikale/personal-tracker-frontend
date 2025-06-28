import React, { useState } from 'react';
import api from '../services/api';
import { FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ExpenseFilter.css';

const ExpenseFilter = ({ onFiltered }) => {
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (month) params.append('month', month);

      const res = await api.get(`/expenses/filter?${params.toString()}`);

      if (res.data.length === 0) {
        toast.info('No expenses found for the selected filter.');
      }

      onFiltered(res.data);
    } catch (err) {
      toast.error('Failed to apply filters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-container" role="region" aria-label="Expense Filters">
      <div className="filter-group">
        <label htmlFor="category-select" className="filter-label">Category</label>
        <select
          id="category-select"
          aria-label="Select expense category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All</option>
          <option value="FOOD">Food</option>
          <option value="TRANSPORT">Transport</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="UTILITIES">Utilities</option>
          <option value="HEALTH">Health</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="month-select" className="filter-label">Month</label>
        <input
          id="month-select"
          type="month"
          aria-label="Select month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="filter-input"
        />
      </div>

      <button
        onClick={handleFilter}
        className="filter-button"
        disabled={(!category && !month) || loading}
        aria-label="Apply selected filters"
      >
        {loading ? (
          <svg className="spinner" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="spinner-path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        ) : (
          <>
            <FaFilter /> Apply Filter
          </>
        )}
      </button>
    </div>
  );
};

export default ExpenseFilter;
