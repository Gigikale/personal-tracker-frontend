import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/MonthlyTotal.css';

const MonthlyTotal = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyTotal = async () => {
      try {
        const res = await api.get('/expenses/summary/monthly');
        const formatted = res.data.map(([month, amount]) => ({
          month: String(month).trim(), // Ensure string & remove trailing spaces
          amount,
        }));

        // Optional: Sort by newest first
        const sorted = formatted.sort((a, b) => {
          const dateA = new Date(`01-${a.month}`);
          const dateB = new Date(`01-${b.month}`);
          return dateB - dateA;
        });

        setMonthlyData(sorted);
      } catch (error) {
        toast.error('Failed to load monthly totals');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyTotal();
  }, []);

  // Convert "June-2025" to "June 2025"
  const formatMonthYear = (value) => {
    if (!value) return 'N/A';
    return value.replace('-', ' ');
  };

  return (
    <div className="monthly-container">
      <h3 className="monthly-title">Total Expenses by Month</h3>

      {loading ? (
        <div className="spinner-wrapper">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : (
        <table className="monthly-table">
          <caption className="sr-only">Monthly expense totals by category</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Total (₦)</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(({ month, amount }) => (
              <tr key={month}>
                <td>{formatMonthYear(month)}</td>
                <td title={`Total for ${formatMonthYear(month)}`}>{amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MonthlyTotal;
