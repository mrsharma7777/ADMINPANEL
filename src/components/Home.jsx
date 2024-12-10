import io from 'socket.io-client';
import axios from 'axios';
import DataTable from 'datatables.net-dt';
import React, { useEffect, useState, useRef } from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill }
  from 'react-icons/bs'
import ExistingUserSection from './ExistingUserSection';
//import './bootstrap.min.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//import './datatables.css';


//let table = new DataTable('#myTable')


function Home() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState(''); // State for Date of Birth
  const [totals, setTotals] = useState({ totalDebit: 0, totalCredit: 0, balance: 0 });
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [editTransaction, setEditTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const modalRef = useRef(null);
  const fetchUsers = () => {
    axios.get('http://localhost:8080/user/list')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('http://localhost:8080/live');
        setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };
    fetchTransactions();

    // Optional: Implement a polling mechanism to update transactions every few seconds
    const interval = setInterval(fetchTransactions, 5000); // Updates every 5 seconds
    return () => clearInterval(interval);
  }, []);
  // Fetch live totals when the component amounts
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const response = await axios.get('http://localhost:8080/transaction/totals');
        setTotals(response.data);
      } catch (error) {
        console.error('Error fetching transaction totals:', error);
      }
    };

    fetchTotals();
    const interval = setInterval(fetchTotals, 5000); // Updates every 5 seconds
    return () => clearInterval(interval);
  }, []);
  const filteredTransactions = transactions.filter(transaction => {
    const debitName = transaction.from_user_name || '';
    const creditName = transaction.to_user_name || '';
    return (
      debitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/count');
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error('Error fetching total users:', error);
      }
    };

    fetchTotalUsers();

    // Setup a periodic update for live results
    const interval = setInterval(() => {
      fetchTotalUsers();
    }, 5000); // Fetch total users every 5 seconds

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);
  const formatDate = (dateString) => {
    // Create a new date object from the UTC date
    const localDate = new Date(dateString);

    // Extract the local year, month, and day
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(localDate.getDate()).padStart(2, '0');

    // Return the formatted date as DD-MM-YY
    return `${day}-${month}-${String(year).slice(2)}`;
  };
  const handleSubmitNewUser = async (e) => {
    e.preventDefault();

    const existingUser = users.find(
      (user) => user.mobile_number === mobileNumber
    );

    if (existingUser) {
      alert('User with this name or mobile number already exists.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/user/add', {
        name,
        mobile: mobileNumber,
        dob // Send the date of birth to the backend
      });

      fetchUsers();
      setShowNewUserForm(false);
      setName('');
      setMobileNumber('');
      setDob(''); // Clear the Date of Birth field
    } catch (error) {
      console.error('Error adding new user:', error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowNewUserForm(false);
      }
    };

    if (showNewUserForm) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewUserForm]);
  const openModal = (transaction) => {
    setEditTransaction({
      ...transaction,
      name: transaction.from_user_name || transaction.to_user_name || 'Unknown User'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTransaction(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target || {}; // Destructure name and value from e.target if it exists
    setEditTransaction(prevTransaction => ({
      ...prevTransaction,
      [name]: value
    }));
  };

  // Function specifically for handling DatePicker changes
  const handleDateChange = (date) => {
    setEditTransaction(prevTransaction => ({
      ...prevTransaction,
      date: date ? date.toISOString().split('T')[0] : '' // Store date in YYYY-MM-DD format
    }));
  };
  function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // const YourComponent = ({ editTransaction }) => {
  // Use editTransaction only after ensuring it exists
  //  const [dob, setDob] = useState(
  //  editTransaction?.date ? new Date(editTransaction.date) : new Date()
  // );
  // };
  const saveTransaction = async () => {
    try {
      await axios.put(`http://localhost:8080/transaction/${editTransaction.id}`, editTransaction);
      closeModal();
      // Optionally refresh transactions list after editing
      const res = await axios.get('http://localhost:8080/live');
      setTransactions(res.data);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const calculateAllBalances = (transactions) => {
    const balances = {};

    transactions.forEach((transaction) => {
      // Handle debit (from_user_name)
      if (transaction.from_user_name) {
        const name = transaction.from_user_name;
        balances[name] = (balances[name] || 0) - Number(transaction.amount); // Ensure subtraction
      }

      // Handle credit (to_user_name)
      if (transaction.to_user_name) {
        const name = transaction.to_user_name;
        balances[name] = (balances[name] || 0) + Number(transaction.amount); // Ensure addition
      }
    });

    return balances;
  };

  // Get all balances <h1 style={{ color: "black" }} >DASHBOARD</h1>
  const allBalances = calculateAllBalances(filteredTransactions);


  return (

    <main className='main-container'>

      <div className='main-cards'>
        <div className='card'>
          <div className='card-inner'>
            <h3 className='large-text' style={{ color: "white" }}>Users</h3>

          </div>
          <h1 style={{ color: "white" }}>{totalUsers}</h1>
        </div>
        <div className='card'>
          <div className='card-inner'>
           
          </div>
          <p style={{ color: "white" }} className='large-text'><strong>Total Debit:</strong> {formatCurrency(totals.totalDebit)}</p>

        </div>

        <div className='card'>
          <div className='card-inner'>
          </div>
          <p style={{ color: "white" }} className='large-text'><strong>Total Credit:</strong> {formatCurrency(totals.totalCredit)}</p>
        </div>

        <div className='card'>
          <div className='card-inner'>

          </div>
          <p style={{ color: "white" }} className='large-text'><strong>Balance:
          </strong> {formatCurrency(totals.balance)}</p>
        </div>
      </div>


      <div className="dashboard">
        <h3 style={{ color: "black" }}>Live Transactions</h3>
        {!showNewUserForm && (
          <div className="new-entry-btn-container">
            <button onClick={() => setShowNewUserForm(true)} className="new-entry-btn">
              Add User
            </button>
            <ExistingUserSection />
          </div>
        )}

        {showNewUserForm && (
          <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
              <button className="close-btn" onClick={() => setShowNewUserForm(false)}>×</button>
              <h2 className="modal-title">New User Entry</h2>
              <form onSubmit={handleSubmitNewUser} className="modal-form">
                <div className="form-group">

                  <label>Name:</label>
                  <input
                    className="name-input"
                    placeholder="Enter your name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number:</label>
                  <input
                    className="mobile-input"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        setMobileNumber(value);
                      }
                    }}
                    pattern="\d{10}"
                    placeholder="Enter 10-digit mobile number"
                    title="Mobile number must be exactly 10 digits"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <DatePicker
                    selected={dob ? new Date(dob) : null} // Convert dob to Date if it's set
                    onChange={(date) => setDob(date ? date.toISOString().split('T')[0] : '')} // Store in YYYY-MM-DD format
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select DOB"
                    // Restrict selection to dates in the past
                    showYearDropdown // Optional: show year dropdown for easier navigation
                    scrollableYearDropdown // Optional: make year dropdown scrollable
                  />

                </div>

                <button className="submit-btn" type="submit">Submit New Entry</button>
              </form>

            </div>
          </div>
        )}
        <table className="transaction-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Name (Balance)</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Description</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => {
              const debitName = transaction.from_user_name || '-';
              const creditName = transaction.to_user_name || '-';
              const debitAmount = transaction.from_user_name ? `${transaction.amount}` : '-';
              const creditAmount = transaction.to_user_name ? `${transaction.amount}` : '-';

              // Fetch the latest balance for the name
              const balance =
                debitName !== '-'
                  ? allBalances[debitName]
                  : allBalances[creditName];

              // Format balance with "+" or "-" sign and proper spacing
              const formattedBalance =
                balance > 0
                  ? `+${balance.toLocaleString()}`
                  : balance === 0
                    ? '0'
                    : `-${Math.abs(balance).toLocaleString()}`;

              // Display name with balance
              const nameWithBalance =
                debitName !== '-'
                  ? `${debitName} (${formattedBalance})`
                  : `${creditName} (${formattedBalance})`;

              return (
                <tr key={transaction.id}>
                  <td>{index + 1}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{nameWithBalance}</td>
                  <td style={{ color: "red" }}>
                    {isNaN(Number(debitAmount)) || debitAmount === undefined ? "-" : formatCurrency(Number(debitAmount))}</td>
                  <td style={{ color: "green" }}>{isNaN(Number(creditAmount)) || creditAmount === undefined ? "-" : formatCurrency(Number(creditAmount))}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal(transaction)}>+</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {isModalOpen && (
          <div isOpen={isModalOpen} onRequestClose={closeModal} className='modal-overlay' ref={modalRef} contentLabel="Edit Transaction">
            <div className="modal-content">
              <h2 style={{ color: "black" }}>Edit Transaction</h2>
              <h2 style={{ color: "blue" }}>{editTransaction?.name || 'Unknown User'}</h2>
              <form>
                <label className='color'>
                  Date:
                  <DatePicker
                    selected={new Date(editTransaction?.date || new Date())} // Set initial selected date
                    onChange={handleDateChange} // Use custom date change handler
                    dateFormat="dd/MM/yyyy"
                     maxDate={new Date()}
                  />
                </label>
                <label className='color'>
                  Amount:
                  <input
                    type="number"
                    name="amount"
                    value={editTransaction?.amount || ''}
                    onChange={handleInputChange}
                  />
                </label>
                <label className='color'>
                  Description:
                  <input
                    type="text"
                    name="description"
                    value={editTransaction?.description || ''}
                    onChange={handleInputChange}
                  />
                </label>
              </form>
              <div className="button-group">
                <button onClick={saveTransaction}>Save</button>
                <button onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Home
