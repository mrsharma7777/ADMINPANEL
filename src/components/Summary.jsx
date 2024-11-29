import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Summary.css';

const SummaryPage = () => {
  const [date, setDates] = useState(''); // Replaced 'date' with 'dates'
  const [name, setName] = useState(''); // Store selected name
  const [names, setNames] = useState([]); // Store all available names
  const [filteredData, setFilteredData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0); // Store total debit
  const [totalCredit, setTotalCredit] = useState(0);
  const [balance, setBalance] = useState(0); // Store total credit

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
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const response = await axios.get('http://localhost:8080/transaction/totals');
        const { totalDebit, totalCredit, balance } = response.data;
  
        setTotalDebit(totalDebit);
        setTotalCredit(totalCredit);
        setBalance(balance);
      } catch (error) {
        console.error('Error fetching transaction totals:', error);
      }
    };
  
    // Fetch totals when component mounts
    fetchTotals();
  }, []);
  

  // Handle changes for dates and name
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDates(today); // Replaced 'setDate' with 'setDates'
  }, []);

  // Handle the filter action based on dates and name
  const handleFilter = async () => {
    if (date || name) {
      try {
        const response = await axios.get('http://localhost:8080/transaction/date', {
          params: { date: date, name }, // Changed 'date' param to 'dates'
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

  return (
    <div className="summary-page container">
      <h2>{name}</h2>

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

        <label htmlFor="dates">Date:</label> {/* Changed 'date' to 'dates' */}
        <input
          type="date"
          id="dates"
          value={date} // Replaced 'date' with 'dates'
          onChange={(e) => setDates(e.target.value)} // Replaced 'setDate' with 'setDates'
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      <div className="row">
        <div className="col-md-6">
          {/* Render filtered transactions */}
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
                    <td>
                      {new Date(transaction.date).toLocaleDateString()}
                      <h4>{transaction.description}</h4>
                    </td>
                    <td>
                      {transaction.from_user_name ? '-' : ''}
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totals Section */}
        <div className="col-md-6">
          <div className="total">
            <h3>Transaction Totals</h3>
            <p>
              <strong>Total Amount Debit:</strong> ₹{totalDebit.toFixed(2)}
            </p>
            <p>
              <strong>Total Amount Credit:</strong> ₹{totalCredit.toFixed(2)}
            </p>
            <p>
              <strong>Balance:</strong> ₹{(totalCredit - totalDebit).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <nav className="navbar">
      <ul>
       
      </ul>
    </nav>
    </div>
  );
};

export default SummaryPage;
