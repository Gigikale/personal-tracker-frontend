import React, { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { FaPlusCircle } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AddExpenseForm.css";

const AddExpenseForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.description ||
      !formData.amount ||
      !formData.category ||
      !formData.date
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/expenses", {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success("Expense added successfully!");
      setFormData({ description: "", amount: "", category: "", date: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add expense. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="form-title">Add New Expense</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Lunch"
          />
        </div>

        <div className="form-group">
          <label>Amount (₦)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g., 1500"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            <option value="FOOD">Food</option>
            <option value="TRANSPORT">Transport</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="UTILITIES">Utilities</option>
            <option value="HEALTH">Health</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? (
            <svg className="spinner" viewBox="0 0 24 24">
              <circle
                className="circle"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="path"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            <>
              <FaPlusCircle /> Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;
