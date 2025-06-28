import React, { useEffect, useState } from "react";
import api from "../services/api";
import ExpenseCharts from "./ExpenseCharts";
import MonthlyTargetForm from "./MonthlyTargetForm";
import EditExpenseModal from "./EditExpenseModal";
import EditTargetModal from "./EditTargetModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/SummaryPage.css";

const SummaryPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    fetchExpenses();
    fetchTargets();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      const data = res.data;
      setExpenses(data);

      const totalAmount = data.reduce((sum, exp) => sum + exp.amount, 0);
      setTotal(totalAmount);

      const summary = data.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

      const formatted = Object.entries(summary).map(([category, amount]) => ({
        category,
        amount,
      }));

      setCategorySummary(formatted);
    } catch (error) {
      toast.error("Failed to fetch summary data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const res = await api.get("/targets");
      setTargets(res.data);
    } catch (err) {
      toast.error("Failed to load targets");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      FOOD: "#4CAF50",
      TRANSPORT: "#FF9800",
      ENTERTAINMENT: "#9C27B0",
      UTILITIES: "#03A9F4",
      HEALTH: "#dfb9f9",
      OTHER: "#F44336",
    };
    return colors[category] || "#607D8B";
  };

  const handleEditTarget = async () => {
    try {
      await api.put(`/targets/${selectedTarget.id}`, {
        targetAmount: parseFloat(newAmount),
      });
      toast.success("Target updated successfully!");
      setShowModal(false);
      fetchTargets();
    } catch (error) {
      toast.error("Failed to update target");
    }
  };

  return (
    <div className="summary-container">
      <h2 className="summary-title">Expense Summary</h2>
      <ExpenseCharts />

      {loading ? (
        <div className="loading-spinner-wrapper">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle
              className="circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      ) : (
        <>
          <div className="summary-card total-expense">
            <h3 className="card-title">Total Expenses:</h3>
            <p className="total-amount">₦{total.toLocaleString()}</p>
          </div>

          <div className="summary-grid">
            {/* Category Summary */}
            <div className="summary-card">
              <h3 className="card-title">Expenses by Category</h3>
              <ul className="category-list">
                {categorySummary.map(({ category, amount }) => {
                  const targetObj = targets.find(
                    (t) => t.category === category
                  );
                  const target = targetObj ? targetObj.targetAmount : 0;
                  const id = targetObj ? targetObj.id : null;

                  return (
                    <li key={category} className="category-item">
                      <div>
                        <strong>{category}</strong> - ₦{amount.toLocaleString()}
                      </div>
                      <div>
                        <span style={{ marginRight: "1rem" }}>
                          🎯 Target: ₦{target.toLocaleString()}
                        </span>
                        {id && (
                          <button
                            onClick={() => {
                              setSelectedTarget({ id, category });
                              setNewAmount(target);
                              setShowModal(true);
                            }}
                            className="btn-edit"
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Chart */}
            <div className="summary-card">
              <h3 className="card-title">Chart View</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Bar dataKey="amount">
                    {categorySummary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCategoryColor(entry.category)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <EditTargetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        category={selectedTarget?.category}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        onSave={handleEditTarget}
      />
      <EditExpenseModal />
      <MonthlyTargetForm />
      <EditTargetModal />
    </div>
  );
};

export default SummaryPage;
