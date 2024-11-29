import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const UserLogin = () => {
  const [userNumber, setUserNumber] = useState('');
  const [userDOB, setUserDOB] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleUserLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: userNumber, dob: userDOB }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the Expense page on successful login
        navigate('/expense');
      } else {
        setErrorMessage(data.message || 'Invalid number or date of birth.');
      }
    } catch (error) {
      console.error('Error during user login:', error);
      setErrorMessage('Server error, please try again later.');
    }
  };

  return (
    <div className="user-login-container">
      <h2>User Login</h2>
      <input
        type="tel"
        placeholder="Enter Mobile Number"
        value={userNumber}
    
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,10}$/.test(value)) {
            setUserNumber(value);
          }
        }}
        pattern="\d{10}"
      />
      <input
        type="password"
        placeholder="Enter Date of Birth (YYYY-MM-DD)"
        value={userDOB}
        onChange={(e) => setUserDOB(e.target.value)}
      />
      <button onClick={handleUserLogin}>Login</button>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default UserLogin;
