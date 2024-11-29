import React, { useState } from 'react';
import Modal from 'react-modal';
import ExpenseForm from './ExpenseForm';
import './AdminExpensePage.css';

const UserExpensePage = ({ userData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openExpenseModal = () => {
    setIsModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="admin-expense-page">
      <h1>Welcome, {userData.name}</h1>
      <p>Manage your transactions below.</p>

      <div className="add-transaction-container">
        <button onClick={openExpenseModal} className="add-transaction-btn">
          Add Transaction
        </button>
      </div>

      {/* ExpenseForm Popup Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeExpenseModal}
        contentLabel="Add Transaction"
        ariaHideApp={false}
        className="expense-modal"
        overlayClassName="modal-overlay"
      >
        <ExpenseForm
          userData={userData}
          setUserData={() => {}} // Can be left empty as the user is pre-logged in
          closeModal={closeExpenseModal}
        />
      </Modal>
    </div>
  );
};

export default UserExpensePage;
