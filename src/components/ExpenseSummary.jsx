import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/ExpenseSummary.css';

const ExpenseSummary = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/expenses/summary/category'); 
        const formatted = res.data.reduce((acc, [category, total]) => {
          acc[category] = total;
          return acc;
        }, {});
        setSummary(formatted);
      } catch (error) {
        toast.error('Failed to load expense summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="expense-summary-container" role="region" aria-label="Expense summary section">
      <h3 className="expense-summary-title">Summary by Category</h3>

      {loading ? (
        <div className="expense-summary-spinner" role="status" aria-live="polite">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : (
        <table
          className="expense-summary-table"
          aria-label="Expense totals grouped by category"
        >
          <caption className="sr-only">Table showing expense totals for each category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Total Amount (₦)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary).map(([category, total]) => (
              <tr key={category}>
                <td>{capitalize(category)}</td>
                <td>{Number(total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Utility to make category names readable
const capitalize = (word) => {
  return word
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

export default ExpenseSummary;
