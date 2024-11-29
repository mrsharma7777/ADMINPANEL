import React, { useState } from 'react';

const EntryList = ({ entries, addDetails }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddDetails = (entry) => {
    addDetails(entry.name, entry.mobileNumber, amount, description);
    setAmount('');
    setDescription('');
  };

  return (
    <div>
      <h2>View Entries</h2>
      <ul>
        {entries.map((entry, index) => (
          <li key={index}>
            <p>Name: {entry.name}</p>
            <p>Mobile: {entry.mobileNumber}</p>
            {entry.amount && entry.description ? (
              <>
                <p>Amount: {entry.amount}</p>
                <p>Description: {entry.description}</p>
              </>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button onClick={() => handleAddDetails(entry)}>Save Details</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EntryList;
