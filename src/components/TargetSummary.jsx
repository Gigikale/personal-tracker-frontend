import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import Select from 'react-select';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TargetSummary = () => {
  const [months, setMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const res = await api.get('/expenses/summary/target-months');
        const formatted = res.data.map(m => ({
          value: m,
          label: new Date(m + '-01').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })
        }));
        setMonths(formatted);
        if (formatted.length > 0) setSelectedMonths([formatted[0]]);
      } catch {
        toast.error('Failed to load available months');
      }
    };
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      if (selectedMonths.length === 0) return;
      setLoading(true);
      try {
        const res = await api.post(
          '/expenses/summary/targets/multi',
          selectedMonths.map(m => m.value)
        );
        setSummary(res.data);
      } catch {
        toast.error('Failed to load target summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedMonths]);

  const getStatusStyle = (status) => ({
    color: status === 'Under Target' ? '#16a34a' : '#dc2626',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  });

  const getStatusIcon = (status) => (
    status === 'Under Target' ? '✅' : '🛑'
  );

  const getPercentage = (spent, target) => {
    if (target === 0) return 0;
    return Math.round((spent / target) * 100);
  };

  const sendEmail = () => {
    const subject = `Monthly Target Summary Report`;
    const body = summary.map(s =>
      `Month: ${s.month}\nCategory: ${s.category}\nTarget: ₦${s.target.toLocaleString()}\nSpent: ₦${s.spent.toLocaleString()}\nStatus: ${s.status}`
    ).join('\n\n');
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={styles.title}>Monthly Targets Summary</h3>
        <button style={styles.emailButton} onClick={sendEmail}>📧 Email Report</button>
      </div>

      <div style={{ marginBottom: '1rem', maxWidth: 300 }}>
        <label style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Select Month(s):</label>
        <Select
          isMulti
          value={selectedMonths}
          onChange={setSelectedMonths}
          options={months}
          placeholder="Choose month(s)..."
        />
      </div>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        <>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Month</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Target (₦)</th>
                <th style={styles.th}>Spent (₦)</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Target Met (%)</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, index) => {
                const percentage = getPercentage(item.spent, item.target);
                const barColor = percentage > 100 ? '#dc2626' : '#10b981'; // ✅ red if target exceeded
                return (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{item.month}</td>
                    <td style={styles.td}>{item.category}</td>
                    <td style={styles.td}>{item.target.toLocaleString()}</td>
                    <td style={styles.td}>{item.spent.toLocaleString()}</td>
                    <td style={{ ...styles.td, ...getStatusStyle(item.status) }}>
                      {getStatusIcon(item.status)} {item.status}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.barContainer}>
                        <div style={{ ...styles.barFill, width: `${Math.min(percentage, 100)}%`, background: barColor }} />
                        <span style={styles.barText}>{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ width: '100%', height: 360, marginTop: '2rem' }}>
            <ResponsiveContainer>
              <BarChart data={summary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(val) => `₦${Number(val).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="target" fill="#4f46e5" name="Target" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#1f2937'
  },
  emailButton: {
    padding: '8px 12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '16px',
    fontSize: '16px',
    color: '#6b7280'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  thead: {
    backgroundColor: '#f3f4f6'
  },
  th: {
    padding: '12px',
    border: '1px solid #d1d5db',
    fontWeight: '600',
    fontSize: '16px'
  },
  td: {
    padding: '12px',
    border: '1px solid #e5e7eb',
    fontSize: '15px'
  },
  tr: {
    textAlign: 'center',
    transition: 'background 0.2s ease-in-out'
  },
  barContainer: {
    position: 'relative',
    background: '#e5e7eb',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%'
  },
  barText: {
    position: 'absolute',
    top: '-20px',
    right: '5px',
    fontSize: '12px',
    fontWeight: 'bold'
  }
};

export default TargetSummary;
