import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ExpenseList from './components/ExpenseList';
import SummaryPage from './components/SummaryPage';
import AddExpenseForm from './components/AddExpenseForm';
import MonthlyTotal from './components/MonthlyTotal';
import ExpenseSummary from './components/ExpenseSummary';
import MonthlyTargetForm from './components/MonthlyTargetForm';
import { ToastContainer } from 'react-toastify';
import { FaSun, FaMoon } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import TargetSummary from './components/TargetSummary';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'theme-dark' : 'theme-light'}>
      <h1 className="title">Personal Expense Tracker !!!</h1>

      <div className="app-container">
        <Router>
          <nav className="navbar">
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/add" className="nav-link">Add Expense</Link>
              <Link to="/summary" className="nav-link">Summary</Link>
              <Link to="/monthly-total" className="nav-link">Monthly Total</Link>
              <Link to="/category-summary" className="nav-link">Category Summary</Link>
              <Link to="/target-summary" className="nav-link">Target Summary</Link>
            </div>
            <button className="toggle-btn" onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<ExpenseList />} />
              <Route path="/add" element={<AddExpenseForm onAdded={() => {}} />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/monthly-total" element={<MonthlyTotal />} />
              <Route path="/category-summary" element={<ExpenseSummary />} />
              <Route path="/set-target" element={<MonthlyTargetForm />} />
              <Route path="/target-summary" element={<TargetSummary />} /> 
            </Routes>
          </main>
        </Router>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          theme={darkMode ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
};

export default App;
