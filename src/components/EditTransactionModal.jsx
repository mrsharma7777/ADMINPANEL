import React, { useState, useEffect } from 'react';
import './edit.css';
const EditTransactionModal = ({ transaction, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date).toISOString().substr(0, 10), // Date in YYYY-MM-DD format
        amount: transaction.amount || '',
        description: transaction.description || '',
      });
    }
  }, [transaction]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(transaction.id, formData); // Save updated data
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Edit Transaction</h2>
        <form>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
          />
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          ></textarea>
        </form>
        <a href="#" className='save'><button onClick={handleSave}>Save</button></a>
        <a href="#" className='cancel'><button onClick={onClose}>Cancelaaas</button></a>
      </div>
    </div>
  );
};

export default EditTransactionModal;
