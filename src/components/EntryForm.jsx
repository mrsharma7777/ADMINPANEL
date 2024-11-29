/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryForm.css'

const EntryForm = ({ setUserData }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData({ name, mobile: mobileNumber });
    navigate('/confirmation');
  };

  return (
    <div className='box'>
      <div className="entry-form">
        <h2 className="text">Add Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mobile Number:</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              pattern="\d{10}"
              maxLength="10"
              title="Mobile number must be exactly 10 digits"
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>

  );
};

export default EntryForm;*/
/*
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryForm.css';
import axios from 'axios';  // Assuming you're using axios for HTTP requests

const EntryForm = ({ setUserData }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [users, setUsers] = useState([]);  // To store the fetched user data
  const [selectedUser, setSelectedUser] = useState(null);  // To store the selected user
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from the database
    axios.get('http://localhost:8080/transaction')  // Replace with your actual API endpoint
      .then(response => {
        setUsers(response.data);  // Assuming the response data is an array of users
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData({ name, mobile: mobileNumber });
    navigate('/confirmation');
  };

  const handleSelectUser = (e) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === parseInt(userId));
    setSelectedUser({name: user.name, mobile: user.mobile_number});
  };

  const handleDirectToExpense = () => {
    if (selectedUser) {
      setUserData(selectedUser);
      navigate('/expense');
    }
  };

  return (
    <div className='box'>
      <div className="entry-form">
        <h2 className="text">Add Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mobile Number:</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              pattern="\d{10}"
              maxLength="10"
              title="Mobile number must be exactly 10 digits"
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>

        {/* Dropdown for selecting existing users
        <div className="user-dropdown">
          <label>Select an Existing User:</label>
          <select onChange={handleSelectUser}>
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.mobile_number}
              </option>
            ))}
          </select>
          <button onClick={handleDirectToExpense} disabled={!selectedUser}>
            Go to Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;

/*import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryForm.css';
import axios from 'axios';

const EntryForm = ({ setUserData }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [suggestions, setSuggestions] = useState([]);  // Store name suggestions with mobile numbers
  const [selectedUser, setSelectedUser] = useState(null);  // Store the selected user
  const navigate = useNavigate();

  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      console.log({input})
      const response = await axios.get(`http://localhost:8080/transaction/search?name=${input}`);
      setSuggestions(response.data);  // Assuming the response is an array of suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleNameChange = (e) => {
    const inputValue = e.target.value;
    setName(inputValue);
    fetchSuggestions(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setName(suggestion.name);
    setMobileNumber(suggestion.mobile_number);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData({ name, mobile: mobileNumber });
    navigate('/confirmation');
  };

  const handleSelectUser = (e) => {
    const userId = e.target.value;
    const user = suggestions.find(u => u.id === parseInt(userId));
    setSelectedUser({ name: user.name, mobile: user.mobile_number });
  };

  const handleDirectToExpense = () => {
    if (selectedUser) {
      setUserData(selectedUser);
      navigate('/expense');
    }
  };

  return (
    <div className='box'>
      <div className="entry-form">
        <h2 className="text">Add Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
            />
            {/* Suggestions dropdown 
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion.name} - {suggestion.mobile_number}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Mobile Number:</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              pattern="\d{10}"
              maxLength="10"
              title="Mobile number must be exactly 10 digits"
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>

        {/* Dropdown for selecting existing users 
        <div className="user-dropdown">
          <label>Select an Existing User:</label>
          <select onChange={handleSelectUser}>
            <option value="">Select a user</option>
            {suggestions.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.mobile_number}
              </option>
            ))}
          </select>
          <button onClick={handleDirectToExpense} disabled={!selectedUser}>
            Go to Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryForm.css';
import axios from 'axios';

const EntryForm = ({ setUserData }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState(''); // State for Date of Birth
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:8080/user/list')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
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

  const handleDirectToExpense = () => {
    if (selectedUser) {
      navigate('/expense');
    }
  };

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

  return (

    <div className="entry-container">
      <div className="existing-user-section">
        <h2 className="text">Existing User</h2>
        <div className="user-search">
          <label>Search for an Existing User:</label>
          <input
            type="text"
            placeholder="Search by name or mobile number"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="user-list">
            {searchQuery && filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  {user.name} - {user.mobile_number}
                </div>
              ))
            ) : (
              searchQuery && <p>No users found</p>
            )}
          </div>
          <button onClick={handleDirectToExpense} disabled={!selectedUser} className='expensebtn'>
            Go to Expenses
          </button>
        </div>
      </div>

      {!showNewUserForm && (
        <div className="new-entry-btn-container">
          <button onClick={() => setShowNewUserForm(true)} className="new-entry-btn">
            Add New User
          </button>
        </div>
      )}

      {showNewUserForm && (
        <div className="new-user-section">
          <h2 className="text">New User Entry</h2>
          <form onSubmit={handleSubmitNewUser}>
            <div className="form-">
              <label>Name:</label>
              <input
                className='name'
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-">
              <label>Mobile Number:</label>
              <input
                className='Num'
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
            <div className="form-">
              <label>Date of Birth:</label>
              <input
                className='dob'
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <button className='submit1' type="submit">Submit New Entry</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EntryForm;

/*
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryForm.css';
import axios from 'axios';

const EntryForm = ({ setUserData }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users from the backend
  const fetchUsers = () => {
    axios.get('http://localhost:8080/transaction')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
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

  const handleDirectToExpense = () => {
    if (selectedUser) {
      navigate('/expense');
    }
  };

  // Handle form submission for adding a new user
  const handleSubmitNewUser = (e) => {
    e.preventDefault();

    const newUser = { name, mobile: mobileNumber };
    
    // Send POST request to save the new user
    axios.post('http://localhost:8080/transaction', newUser)
      .then(response => {
        console.log('New user added:', response.data);
        
        // Fetch updated list of users including the new one
        fetchUsers();

        // Clear form fields
        setName('');
        setMobileNumber('');
        
        // Hide new user form
        setShowNewUserForm(false);
      })
      .catch(error => {
        console.error('Error adding new user:', error);
      });
  };

  return (
    <div className="entry-container">
      {/* Existing User Section *
      <div className="existing-user-section">
        <h2 className="text">Existing User</h2>
        <div className="user-search">
          <label>Search for an Existing User:</label>
          <input
            type="text"
            placeholder="Search by name or mobile number"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="user-list">
            {searchQuery && filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  {user.name} - {user.mobile_number}
                </div>
              ))
            ) : (
              searchQuery && <p>No users found</p>
            )}
          </div>
          <button onClick={handleDirectToExpense} disabled={!selectedUser} className='expensebtn'>
            Go to Expenses
          </button>
        </div>
      </div>

      {/* New Entry Button *
      {!showNewUserForm && (
        <div className="new-entry-btn-container">
          <button onClick={() => setShowNewUserForm(true)} className="new-entry-btn">
            Add New User
          </button>
        </div>
      )}

      {/* New User Section (Initially hidden) *
      {showNewUserForm && (
        <div className="new-user-section">
          <h2 className="text">New User Entry</h2>
          <form onSubmit={handleSubmitNewUser}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile Number:</label>
              <input
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

            <button type="submit">Submit New Entry</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EntryForm;*/
