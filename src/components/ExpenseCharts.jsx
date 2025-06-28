import React, { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ExpenseCharts = ({ data }) => {
  const COLORS = ['#4CAF50', '#FF9800', '#9C27B0', '#03A9F4', '#EF4444', '#10B981'];

  if (!data || data.length === 0) {
    return <p>No data available to display charts.</p>;
  }

  const categorySummary = Object.values(
    data.reduce((acc, curr) => {
      if (curr.amount > 0) {
        if (!acc[curr.category]) {
          acc[curr.category] = { category: curr.category, amount: 0 };
        }
        acc[curr.category].amount += curr.amount;
      }
      return acc;
    }, {})
  );

  useEffect(() => {
    console.log("categorySummary:", categorySummary);
  }, [categorySummary]);

  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h3>Bar Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount">
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Pie Chart (All Expenses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Pie Chart (By Category Summary)</h3>
        {categorySummary.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySummary}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categorySummary.map((entry, index) => (
                  <Cell key={`summary-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No summary data available.</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseCharts;
