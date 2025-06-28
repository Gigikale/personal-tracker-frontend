import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { toast } from 'react-toastify';

const COLORS = ['#4f46e5', '#059669', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899'];

const ExpensePieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/expenses/summary/category'); 
        const formatted = res.data.map(([category, total]) => ({
          name: category,
          value: total,
        }));
        setData(formatted);
      } catch (err) {
        toast.error('Failed to load pie chart data');
      }
    };

    fetchSummary();
  }, []);

  return (
    <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1f2937' }}>
        Expense Breakdown by Category
      </h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
