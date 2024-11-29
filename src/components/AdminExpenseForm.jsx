/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './ExpenseForm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminExpenseForm = () => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState(''); // Debit or Credit
  const [selectedName, setSelectedName] = useState(''); // Selected user name
  const [submittedTransactions, setSubmittedTransactions] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0); // Total debit for the logged-in user
  const [totalCredit, setTotalCredit] = useState(0); // Total credit for the logged-in user
  const location = useLocation();
  const navigate = useNavigate();

  const userData = location.state?.userData; // User data from admin login state

  // Redirect if user data is missing
  useEffect(() => {
    if (!userData?.name) {
      alert('Please log in as an admin to proceed.');
      navigate('/admin-login');
    } else {
      setSelectedName(userData.name);
    }
  }, [userData, navigate]);

  // Fetch transactions and calculate totals for the logged-in user
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8080/usertotal', {
          params: { name: userData.name },
        });

        // Filter transactions and calculate totals
        const transactions = response.data;
        let debitTotal = 0;
        let creditTotal = 0;

        transactions.forEach((transaction) => {
          if (transaction.from_user_name === userData.name) {
            debitTotal += parseFloat(transaction.amount);
          } else if (transaction.to_user_name === userData.name) {
            creditTotal += parseFloat(transaction.amount);
          }
        });

        setTotalDebit(debitTotal);
        setTotalCredit(creditTotal);
        setBalance(creditTotal - debitTotal);
      } catch (error) {
        console.error('Error fetching user transactions:', error);
      }
    };

    fetchTransactions();
  }, [userData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transactionData = {
      amount,
      description,
      date,
      fromUserName: transactionType === 'debit' ? selectedName : null,
      toUserName: transactionType === 'credit' ? selectedName : null,
      transactionType,
    };

    try {
      const response = await axios.post('http://localhost:8080/transaction/add', transactionData);
      console.log('Transaction saved:', response.data);

      // Add the new transaction to the list of submitted transactions
      setSubmittedTransactions((prevTransactions) => [...prevTransactions, transactionData]);

      // Clear form fields after submission
      setAmount('');
      setDescription('');
      setTransactionType('');

      // Update totals after a new transaction
      if (transactionType === 'debit') {
        setTotalDebit((prev) => prev + parseFloat(amount));
      } else if (transactionType === 'credit') {
        setTotalCredit((prev) => prev + parseFloat(amount));
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving the transaction. Please try again.');
    }
  };

  const handleLogout = () => {
    navigate('/admin-login');
  };

  const handleDebitClick = () => setTransactionType('debit');
  const handleCreditClick = () => setTransactionType('credit');

  return (
    <div className="expense-container">
      <nav>
        <ul>
          <li>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <div className="expense-form-section">
        <div className="expense-form">
          <h1>WELCOME TO USER LOGIN</h1>
          <h2>{selectedName}</h2>

          {/* Display Totals *
          <div className="user-totals">
          
            <div className='main-cards'>

              <div className='card'>
                <div className='card-inner'>
                  <p style={{ color: "white" }} className='large-text'><strong>Total Debit:</strong> ₹{totalDebit.toFixed(2)}</p>
                </div>

              </div>

              <div className='card'>
                <div className='card-inner'>
                </div>
                <p style={{ color: "white" }} className='large-text'><strong>Total Credit:</strong> ₹{totalCredit.toFixed(2)}</p>
              </div>

              <div className='card'>
                <div className='card-inner'>

                </div>
                <p style={{ color: "white" }} className='large-text'>
                  <strong>Balance:</strong> ₹{(totalCredit - totalDebit).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="transaction-type-buttons">
            <button
              type="button"
              className={`transaction-btn ${transactionType === 'debit' ? 'active' : ''}`}
              onClick={handleDebitClick}
            >
              Debit
            </button>
            <button
              type="button"
              className={`transaction-btn ${transactionType === 'credit' ? 'active' : ''}`}
              onClick={handleCreditClick}
            >
              Credit
            </button>
          </div>
          {/* Form *
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Date:</label>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd/MM/yyyy"
              />
            </div>

            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminExpenseForm;*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExpenseForm from './ExpenseForm';
import './AdminExpensePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminExpenseForm = () => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const location = useLocation();
  const navigate = useNavigate();

  const userData = location.state?.userData;

  // Redirect if no user data
  useEffect(() => {
    if (!userData?.name) {
      alert('Please log in as an admin to proceed.');
      navigate('/admin-login');
    }
  }, [userData, navigate]);

  // Fetch transactions and totals
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8080/usertotal', {
          params: { name: userData.name },
        });

        const transactions = response.data;
        let debitTotal = 0;
        let creditTotal = 0;

        transactions.forEach((transaction) => {
          if (transaction.from_user_name === userData.name) {
            debitTotal += parseFloat(transaction.amount);
          } else if (transaction.to_user_name === userData.name) {
            creditTotal += parseFloat(transaction.amount);
          }
        });

        setTransactions(transactions);
        setTotalDebit(debitTotal);
        setTotalCredit(creditTotal);
      } catch (error) {
        console.error('Error fetching user transactions:', error);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 2000); // Updates every 5 seconds
    return () => clearInterval(interval);
  }, [userData.name]);



  // Handle modal open/close   // <h2 style={{ color: "black" }}>{userData?.name}</h2>
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = () => {
    navigate('/admin-login');
  };

  const formatDate = (dateString) => {
    const localDate = new Date(dateString);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${day}-${month}-${String(year).slice(2)}`;
  };

  
  
  return (
    <div className="expense-containers">
      <a href='#'><button className="logout-buttons" onClick={handleLogout}>
        Logout
      </button></a>
      <div className="expense-form-sections">
        <div className="expense-forms">
          <h1 className='name' style={{ color: "black" }}>WELCOME {userData?.name} </h1>

          {/* Display Totals */}
          <div className="user-totals">
            <div className="main-cards">
              <div className="card">
                <div className="card-inner">
                  <p className="large-text" style={{ color: "white" }}>
                    <strong>Total Debit:</strong> ₹{totalDebit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-inner">
                  <p className="large-text" style={{ color: "white" }}>
                    <strong>Total Credit:</strong> ₹{totalCredit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-inner">
                  <p className="large-text" style={{ color: "white" }}>
                    <strong>Balance:</strong> ₹{(totalCredit - totalDebit).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="admin-expense-button">
                <button className="add-expense" onClick={openModal}>
                  Add Expense
                </button>

              </div>
            </div>
          </div>

          {/* Admin Expense Button */}

          {/* Live Transaction Table */}
          <div className="live-transaction-table">
            <h3>Live Transactions</h3>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((transaction, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td style={{ color: "red" }}>
                      {transaction.from_user_name === userData.name ? `₹${transaction.amount}` : '-'}
                    </td>
                    <td style={{ color: "green" }}>
                      {transaction.to_user_name === userData.name ? `₹${transaction.amount}` : '-'}
                    </td>
                    <td>{transaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Adding Transaction */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Add Admin Expense"
          ariaHideApp={false}
          className="expense-modal"
          overlayClassName="modal-overlay"
        >
          <ExpenseForm
            userData={userData}
            closeModal={closeModal}
          />
        </Modal>
      </div>
    </div>
  );
};

export default AdminExpenseForm;
