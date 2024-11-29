import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseForm.css';

const ExpenseForm = ({ userData, setUserData }) => {
  const [date, setDate] = useState('');
  const [name, setName] = useState(''); // Store selected name
  const [names, setNames] = useState([]); // Store all available names
  const [amount, setAmount] = useState(''); // Store entered amount
  const [description, setDescription] = useState(''); // Store description
  const [fromUser, setFromUser] = useState(''); // Track debit account
  const [toUser, setToUser] = useState(''); // Track credit account
  const [filteredData, setFilteredData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0); // Store total debit
  const [totalCredit, setTotalCredit] = useState(0); // Store total credit

  // Fetch all distinct names from the backend on component mount
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

  // Handle changes for date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  // Handle the filter action based on date and name
  const handleFilter = async () => {
    if (date || name) {
      try {
        const response = await axios.get('http://localhost:8080/transaction/date', {
          params: { date, name }, // Send both date and name as query params
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

  const handleExpenseSubmit = async () => {
    if (fromUser && toUser && amount && date) {
      // Add logic to submit expense to backend here
      try {
        const response = await axios.post('http://localhost:8080/transaction/add', {
          from_user: fromUser,
          to_user: toUser,
          amount,
          description,
          date
        });
        alert('Transaction successfully added');
        setAmount('');
        setDescription('');
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    } else {
      alert('Please fill all the fields');
    }
  };

  return (
    <div className="expense-form-container">
      <h2>{name || userData.name}</h2>

      <div className="filter-section">
        <label htmlFor="name">Name:</label>
        <select id="name" value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">--Name--</option>
          {names.map((user, index) => (
            <option key={index} value={user.name}>
              {user.name}
            </option>
          ))}
        </select>

        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      {/* Transaction Details Entry */}
      <div className="transaction-entry-section">
        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="debit-credit-buttons">
          <button onClick={() => setFromUser(name)}>Debit</button>
          <button onClick={() => setToUser(name)}>Credit</button>
        </div>

        <button onClick={handleExpenseSubmit}>Submit Expense</button>
      </div>

      {/* Filtered Data and Totals Section */}
      <div className="filtered-transaction-section">
        <h3>Filtered Transactions</h3>
        {filteredData.length === 0 ? (
          <p>No transactions found for the selected name and date.</p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((transaction, index) => (
                <tr key={index}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.from_user_name ? '-' : ''}{transaction.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totals Section */}
        <div className="total-section">
          <h3>Transaction Totals</h3>
          <p><strong>Total Debit:</strong> ₹{totalDebit.toFixed(2)}</p>
          <p><strong>Total Credit:</strong> ₹{totalCredit.toFixed(2)}</p>
          <p><strong>Balance:</strong> ₹{(totalCredit - totalDebit).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
