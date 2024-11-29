import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Adminpage.css';

const AdminLogin = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const navigate = useNavigate();

  const userData = location.state?.userData;



  // Fetch transactions for the logged-in user
  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8080/transactions/usertotal', {
          params: { name: userData?.name },
        });

        setTransactions(response.data);

        // Calculate total debit, total credit, and balance
        let debitTotal = 0;
        let creditTotal = 0;

        response.data.forEach((transaction) => {
          if (transaction.from_user_name) {
            debitTotal += parseFloat(transaction.amount);
          } else if (transaction.to_user_name) {
            creditTotal += parseFloat(transaction.amount);
          }
        });

        setTotalDebit(debitTotal);
        setTotalCredit(creditTotal);
        setBalance(creditTotal - debitTotal); // Calculate balance
      } catch (error) {
        console.error('Error fetching user transactions:', error);
      }
    };

    fetchUserTransactions();
  }, [userData]);

  const handleLogout = () => {
    navigate('/login'); // Redirect to login page on logout
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/logins', {
        mobile_number: mobileNumber,
        dob: dob,
      });

      console.log('Response from server:', response.data); // Log the full response data

      if (response.status === 200 && response.data.user?.name) {
        console.log('Navigating with userData:', {
          isAdmin: true,
          name: response.data.user.name,
          mobile: mobileNumber,
          dob: dob
        });
        navigate('/admin-expense', {
          state: {
            userData: {
              isAdmin: true,
              name: response.data.user.name,
              mobile: mobileNumber,
              dob: dob
            }
          }
        });
      } else {
        alert('Login successful but name is missing from the response.');
      }
    } catch (error) {
      console.error('Error during login:', error.response?.data);
      alert('Login failed. Please check your credentials.');
    }
  };


  return (
    <div className="admin-login-container">

      <div className="admin-login-box">
        <h2>Users Login</h2>
        <form onSubmit={handleLogin}>
          <div className="forms-groupss Admin">

            <input
              type="text"
              value={mobileNumber}
              placeholder="Mobile Number"
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className="forms-inputss"
            />
          </div>
          <div className="forms-groupss Admin">
            <input
              type="text"
              value={dob}
              placeholder="Date of Birth (YYYY-MM-DD)"
              onChange={(e) => setDob(e.target.value)}
              required
              className="forms-inputss"
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <button className="user-portal-button" onClick={() => navigate('/')}>
          Go to Admin Portal
        </button>
      </div>
    </div>


  );
};

export default AdminLogin;
