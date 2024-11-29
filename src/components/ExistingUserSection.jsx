import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import ExpenseForm from './ExpenseForm';
import './ExistingUserSection.css';

const ExistingUserSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/user/list');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      query
        ? users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.mobile_number.includes(query)
          )
        : []
    );
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUserData({ name: user.name, mobile: user.mobile_number });
  };

  const openExpenseModal = () => {
    if (selectedUser) {
      setIsModalOpen(true);
      setSearchQuery(''); // Clear search input
      setFilteredUsers([]); // Close dropdown
    } else {
      alert('Please select a user first.');
    }
  };

  const closeExpenseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="existing-user-section">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by name or mobile number"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button
          onClick={openExpenseModal}
          disabled={!selectedUser}
          className="go-btn"
        >
          Go
        </button>
        <div className={`user-list ${!filteredUsers.length ? 'hidden' : ''}`}>
          {searchQuery && filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className={`user-item ${
                  selectedUser?.id === user.id ? 'selected' : ''
                }`}
                onClick={() => handleSelectUser(user)}
              >
                {user.name} - {user.mobile_number}
              </div>
            ))
          ) : (
            searchQuery && <p>No users found</p>
          )}
        </div>
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
          setUserData={setUserData}
          closeModal={closeExpenseModal}
        />
      </Modal>
    </div>
  );
};

export default ExistingUserSection;
