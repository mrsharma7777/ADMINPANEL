import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryConfirmation.css';

const EntryConfirmation = ({ userData }) => {
  const navigate = useNavigate();
  const handleProceedToExpense = () => {
    if (userData?.name && userData?.mobile) {
      navigate('/expense');
    } else {
      alert('Please provide both name and mobile number to proceed.');
      navigate('/');
    }
  };

  return (
    <div className="entry-confirmation">
      <h2>Confirm Entry</h2>
      <p>Name: {userData.name}</p>
      <p>Mobile Number: {userData.mobile}</p>
      <button onClick={handleProceedToExpense}>Add Expense</button>
    </div>
  );
};

export default EntryConfirmation;