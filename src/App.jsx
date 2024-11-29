import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import EntryForm from "./components/EntryForm";
import ExpenseForm from "./components/ExpenseForm";
import Adminpage from "./components/Adminpage";
import SummaryPage from "./components/Summary";
import LoginSignup from "./components/Login";
import AdminExpenseForm from "./components/AdminExpenseForm";
import Sidebar from "./components/sidebar"; // Sidebar component
import Header from "./components/Header"; // Header component
import Home from './components/Home';
import LiveTransactionTotals from './components/LiveTransactionTotals';
import ExistingUserSection from './components/ExistingUserSection';
import "./App.css";

const App = () => {
  const [userData, setUserData] = useState({ name: "", mobile: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [activeForm, setActiveForm] = useState('home');

  const handleUserLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem("isAdminLoggedIn", "true");
  };

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedAdminLoginStatus = localStorage.getItem("isAdminLoggedIn");
    if (storedLoginStatus === "true") setIsLoggedIn(true);
    if (storedAdminLoginStatus === "true") setIsAdminLoggedIn(true);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/";
  };

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };
  const toggleShowEntryForm = () => {
    setShowEntryForm((prevShowEntryForm) => !prevShowEntryForm);
  };

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'entry':
        return <EntryForm setUserData={setUserData} />;
      case 'expense':
        return <ExpenseForm userData={userData} setUserData={setUserData} />;
      case 'summary':
        return <SummaryPage />;
      default:
        return <Home />;
    }
  };

  return (
    <Router>
      <div>
        {/* Render LoginSignup if no user or admin is logged in */}
        {!isLoggedIn && !isAdminLoggedIn ? (
          <Routes>
            <Route path="/" element={<LoginSignup onLogin={handleUserLogin} />} />
            <Route path="/admin-login" element={<Adminpage onLogin={handleAdminLogin} />} />

            <Route path="/summary" element={<SummaryPage />} />
            <Route path="*" element={<Navigate to="/expense" replace />} />
            <Route path="/admin-expense" element={<AdminExpenseForm userData={userData} setUserData={setUserData} />} />
          </Routes>
        ) : isLoggedIn ? (
          <>
            <div className="app-container">
              <div className='grid-container'>
                <Header OpenSidebar={OpenSidebar} />
                <Sidebar
                  openSidebarToggle={openSidebarToggle}
                  OpenSidebar={OpenSidebar}
                  onShowEntryForm={toggleShowEntryForm} // Pass the toggle function to Sidebar
                />
                {showEntryForm ? <EntryForm /> : <Home />}
                {/* Show EntryForm or Home */}
              </div>
              {/* User Navigation */}
             
              
            </div>
          </>
        ) : (
          <>
            <div className="app-container">
              {/* Admin Navigation */}
              <nav>
                <ul className="et-hero-tabs-container">

                  <li className="et-hero-tab">
                    <Link to="/admin-expense">Add Expense</Link>
                  </li>
                  <li className="et-hero-tab">
                    <Link to="/summary">View Summary</Link>
                  </li>
                  <li>
                    <a href="#" className="btn btn-danger" onClick={handleLogout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;


/* LATEST APP.js CODE *******************************************************************************************
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import EntryForm from "./components/EntryForm";
import ExpenseForm from "./components/ExpenseForm";
import Adminpage from "./components/Adminpage";
import SummaryPage from "./components/Summary";
import LoginSignup from "./components/Login";
import AdminExpenseForm from "./components/AdminExpenseForm";
import Sidebar from "./components/sidebar"; // Sidebar component
import Header from "./components/Header"; // Header component
import Home from './components/Home';
import LiveTransactionTotals from './components/LiveTransactionTotals';
import ExistingUserSection from './components/ExistingUserSection';
import "./App.css";

const App = () => {
  const [userData, setUserData] = useState({ name: "", mobile: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [activeForm, setActiveForm] = useState('home');

  const handleUserLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem("isAdminLoggedIn", "true");
  };

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedAdminLoginStatus = localStorage.getItem("isAdminLoggedIn");
    if (storedLoginStatus === "true") setIsLoggedIn(true);
    if (storedAdminLoginStatus === "true") setIsAdminLoggedIn(true);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/";
  };

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };
  const toggleShowEntryForm = () => {
    setShowEntryForm((prevShowEntryForm) => !prevShowEntryForm);
  };

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'entry':
        return <EntryForm setUserData={setUserData} />;
      case 'expense':
        return <ExpenseForm userData={userData} setUserData={setUserData} />;
      case 'summary':
        return <SummaryPage />;
      default:
        return <Home />;
    }
  };

  return (
    <Router>
      <div>
        {/* Render LoginSignup if no user or admin is logged in *
        {!isLoggedIn && !isAdminLoggedIn ? (
          <Routes>
            <Route path="/" element={<LoginSignup onLogin={handleUserLogin} />} />
            <Route path="/admin-login" element={<Adminpage onLogin={handleAdminLogin} />} />

            <Route path="/summary" element={<SummaryPage />} />
            <Route path="*" element={<Navigate to="/expense" replace />} />
            <Route path="/admin-expense" element={<AdminExpenseForm userData={userData} setUserData={setUserData} />} />
          </Routes>
        ) : isLoggedIn ? (
          <>
            <div className="app-container">
              <div className='grid-container'>
                <Header OpenSidebar={OpenSidebar} />
                <Sidebar
                  openSidebarToggle={openSidebarToggle}
                  OpenSidebar={OpenSidebar}
                  onShowEntryForm={toggleShowEntryForm} // Pass the toggle function to Sidebar
                />
                {showEntryForm ? <EntryForm /> : <Home />}
                {/* Show EntryForm or Home *
              </div>
              {/* User Navigation *
              <nav>
                <ul className="et-hero-tabs-container">
                  <li className="et-hero-tab">
                    <h1>HI HELLO</h1>
                    <Link to="/add-entry">Add Entry</Link>
                  </li>
                  <li className="et-hero-tab">
                    <Link to="/expense">Add Expense</Link>
                  </li>
                  <li className="et-hero-tab">
                    <Link to="/summary">View Summary</Link>
                  </li>
                  <li className="et-hero-tab">
                    <Link to="/live-transactions">View Summaryssss</Link>
                  </li>
                  <li>
                    <a href="#" className="btn btn-danger" onClick={handleLogout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </nav>
              <Routes>
                 User Routes 
                <Route path="/add-entry" element={<EntryForm setUserData={setUserData} />} />
                <Route
                  path="/expense"
                  element={<ExpenseForm userData={userData} setUserData={setUserData} />}
                />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="/live-transactions" element={<LiveTransactionTotals />} />
                <Route path="*" element={<Navigate to="/add-entry" replace />} />
              </Routes>
            </div>
          </>
        ) : (
          <>
            <div className="app-container">
              {/* Admin Navigation *
              <nav>
                <ul className="et-hero-tabs-container">

                  <li className="et-hero-tab">
                    <Link to="/admin-expense">Add Expense</Link>
                  </li>
                  <li className="et-hero-tab">
                    <Link to="/summary">View Summary</Link>
                  </li>
                  <li>
                    <a href="#" className="btn btn-danger" onClick={handleLogout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
*/