
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './ExpenseForm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ExpenseForm = ({ userData, setUserData, closeModal }) => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState(''); // Debit or Credit
  const [selectedName, setSelectedName] = useState(''); // Selected user name
  const [submittedTransactions, setSubmittedTransactions] = useState([]);
  const [dates, setDates] = useState('');
  const [name, setName] = useState(''); // Store selected name
  const [names, setNames] = useState([]); // Store all available names
  const [filteredData, setFilteredData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0); // Store total debit
  const [totalCredit, setTotalCredit] = useState(0);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Array to store all submitted transactions
  const location = useLocation();

  //const contextUserData = useContext(UserContext); // For email-password login
  //const userData = location.state?.userData || contextUserData;
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:8080/user/list')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      setFilteredUsers(users.filter(user =>
        user.name.toLowerCase().includes(query) || user.mobile_number.includes(query)
      ));
    } else {
      setFilteredUsers([]);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserData({ name: user.name, mobile: user.mobile_number });
  };

  const handleDirectToExpense = () => {
    if (selectedUser) {
      navigate('/expense');
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    const fetchNames = async () => {
      try {
        const response = await axios.get('http://localhost:8080/transaction/names');
        setNames(response.data); // Set the names fetched from the backend
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    };

    fetchNames();
  }, []);

  // Handle changes for date and name
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDates(today);
  }, []);

  // Handle the filter action based on date and name
  const handleFilter = async () => {
    if (dates || name) {
      try {
        const response = await axios.get('http://localhost:8080/transaction/date', {
          params: { dates, name }, // Send both date and name as query params
        });
        setFilteredData(response.data);

        // Calculate totals for debit and credit
        let debitTotal = 0;
        let creditTotal = 0;

        response.data.forEach(transaction => {
          if (transaction.from_user_name) {
            debitTotal += parseFloat(transaction.amount);
          } else {
            creditTotal += parseFloat(transaction.amount);
          }
        });

        setTotalDebit(debitTotal);
        setTotalCredit(creditTotal);

      } catch (error) {
        console.error('Error fetching filtered data:', error);
      }
    } else {
      alert('Please select both a date and a name to filter.');
    }
  };
  // Redirect if user data is missing
  useEffect(() => {
    if (!userData?.name || !userData?.mobile) {
      alert('Please provide both name and mobile number to proceed.');
      navigate('/');
    } else {
      setSelectedName(userData.name); // Set the selected name if userData is present
    }
  }, [userData, navigate]);


  // Automatically set today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form refresh

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
      setSuccessMessage("Transaction saved successfully.");

      // Add the new transaction to the list of submitted transactions
      setSubmittedTransactions((prevTransactions) => [...prevTransactions, transactionData]);

      // Clear form fields after submission
      setAmount('');
      setDescription('');


      closeModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving the transaction. Please try again.');
    }
  };

  const handleDebitClick = () => {
    setTransactionType('debit');
  };

  const handleCreditClick = () => {
    setTransactionType('credit');
  };

  return (
    <div className="expense-container">
      <div className="expense-form-section">
        <div className="expense-form">
          <h2>{selectedName}</h2> {/* Display the selected name */}
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
          {/* Form */}
          <div className='container'>
            <div className="row">
              <div className='col-md-4'>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='container'>
              <div className="row">
                <div className='col-md-4'>
                  <div className="form-group">
                    <label htmlFor="date">Date:</label>
                    <DatePicker
                      selected={date}
                      onChange={(date) => setDate(date)}
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                </div>    
                <div className='col-md-4'>
                  <div className="form-group">
                    <label>Amount:</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className='col-md-4'>
                  <div className="form-group">
                    <label>Description:</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <button>Submit</button>
          </form>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
        </div>
      </div>
      {/* Transaction list *
      <div className="transaction-list-section">
        {submittedTransactions.length > 0 && (
          <div className="transactions-list">
            <h3>{selectedName} Transactions</h3>
            <div className="transactions-scroll">
              {submittedTransactions.map((transaction, index) => (
                <div key={index} className="transaction-item">
                  <p><strong>Date:</strong> {transaction.date}</p>
                  <p>
                    <strong>Amount: ₹</strong> {transaction.transactionType === 'debit' ? '-' : ''}
                    {parseFloat(transaction.amount).toFixed(2)}
                  </p>

                  <p><strong>Description:</strong> {transaction.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>*/}

    </div>

  );
};

export default ExpenseForm;



