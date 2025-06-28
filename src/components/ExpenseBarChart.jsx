import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../styles/ExpenseBarChart.css';

const ExpenseBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('expenses/summary/category');
        const transformed = Object.entries(res.data).map(([category, total], index) => ({
          category: formatCategory(category),
          total: total,
          color: colors[index % colors.length]
        }));
        setData(transformed);
      } catch (err) {
        toast.error('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCategory = (text) =>
    text.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bar-chart-wrapper" aria-label="Bar chart of expenses by category">
      <h3 className="bar-chart-title">Expense Summary by Category</h3>

      {loading ? (
        <p className="bar-chart-loading">Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="total" name="Total Spent (₦)">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ExpenseBarChart;
