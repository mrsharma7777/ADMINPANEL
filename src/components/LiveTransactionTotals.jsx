import React, { useEffect, useRef, useState } from 'react';
import './dashboard.css';
import axios from 'axios';
import Modal from 'react-modal';
import ExistingUserSection from './ExistingUserSection';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


Modal.setAppElement('#root'); // For accessibility, associate modal with root element

const LiveTransactionTotals = () => {
  const [totals, setTotals] = useState({
    totalDebit: 0,
    totalCredit: 0,
    balance: 0,
  });
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState(''); // State for Date of Birth
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [editTransaction, setEditTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState(''); // Debit or Credit

  const modalRef = useRef(null); // The transaction to edit
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

    const interval = setInterval(fetchTransactions, 5000); // Updates every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch initial totals when the component mounts
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const response = await axios.get('http://localhost:8080/transaction/totals');
        setTotals(response.data);
      } catch (error) {
        console.error('Error fetching initial totals:', error);
      }
    };
    fetchTotals();
  }, []);

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

    const interval = setInterval(() => {
      fetchTotalUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const localDate = new Date(dateString);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${day}-${month}-${String(year).slice(2)}`;
  };

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
  const handleDebitClick = () => {
    setTransactionType('debit');
  };

  const handleCreditClick = () => {
    setTransactionType('credit');
  };

  return (
    <div className="dashboard">
      <h3>Live Transactions</h3>

      {/* Row with "Add New User" Button and Search */}
      <div className="user-actions">
        <ExistingUserSection />
        <button onClick={() => setShowNewUserForm(true)} className="new-entry-btn">
          Add New User
        </button>
      </div>

      {/* New User Form Modal */}
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
                <input
                  className="dob-input"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <button className="submit-btn" type="submit">Submit New Entry</button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <table className="transaction-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Name</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Description</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => {
            const debitName = transaction.from_user_name || '-';
            const creditName = transaction.to_user_name || '-';
            const debitAmount = transaction.from_user_name ? `₹${transaction.amount}` : '-';
            const creditAmount = transaction.to_user_name ? `₹${transaction.amount}` : '-';

            return (
              <tr key={transaction.id}>
                <td>{index + 1}</td>
                <td>{formatDate(transaction.date)}</td>
                <td>{debitName !== '-' ? debitName : creditName}</td>
                <td style={{ color: "red" }}>{debitAmount}</td>
                <td style={{ color: "green" }}>{creditAmount}</td>
                <td>{transaction.description}</td>
                <td>
                  <button className="edit-btn" onClick={() => openModal(transaction)}>+</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Edit Transaction Modal */}
      {isModalOpen && (
        <div isOpen={isModalOpen} onRequestClose={closeModal} className='modal-overlay' ref={modalRef} contentLabel="Edit Transaction">
          <div className="modal-content">
            <h2 style={{ color: "black" }}>Edit Transaction</h2>
            <h2 style={{ color: "blue" }}>{editTransaction?.name || 'Unknown User'}</h2> {/* Display the selected name */}
            <form>
              <label className='color'>
                Date:
                <DatePicker
                  selected={new Date(editTransaction?.date || new Date())} // Set initial selected date
                  onChange={handleDateChange} // Use custom date change handler
                  dateFormat="dd/MM/yyyy"
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

            {/* Debit and Credit Buttons */}


            <div className="button-group">
              <button onClick={saveTransaction}>Save</button>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>

      )}
    </div>

  );
};

export default LiveTransactionTotals;
