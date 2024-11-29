/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import user_icon from './person.png';
import email_icon from './email.png';
import password_icon from './password.png';
import show_icon from './show.png';
import hide_icon from './hide.png';

const LoginSignup = ({ onLogin }) => {
  const [action, setAction] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const validateFields = () => {
    let isValid = true;

    if (email === '') {
      setEmailError('Please enter your email.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (password === '') {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (action === 'Sign Up' && name === '') {
      setEmailError('Please enter your name.');
      isValid = false;
    }

    return isValid;
  };


  const handleLogin = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        onLogin();
        navigate('/');
      } else {
        setPasswordError(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setPasswordError('Server error, please try again later.');
    }
  };

  const handleSignup = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful');
        setAction('Login');
      } else {
        setPasswordError(data.message);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setPasswordError('Server error, please try again later.');
    }
  };

  return (
    <div className="container">
      {forgotPassword ? (
        <div className="forgot-password-content">Forgot Password Section</div>
      ) : (
        <>
          <div className="header">
            <div className="text">{action}</div>
            <div className="underline"></div>
          </div>
          <div className="inputs">
            {action === 'Sign Up' && (
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="input">
              <img src={email_icon} alt="" />
              <input
                type="email"
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {emailError && <div className="error-message">{emailError}</div>}
            <div className="input password-input-container">
              <img src={password_icon} alt="" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <img
                src={showPassword ? hide_icon : show_icon}
                alt="toggle visibility"
                className="show-password-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="login-container">
              <h2>Login</h2>
              {/* Your existing login form *
              <button onClick={goToUserLogin} className="user-login-button">
                User Login
              </button>
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}
          </div>
          <div className="submit-container">
            <div
              className={action === 'Login' ? 'submit gray' : 'submit'}
              onClick={() => {
                if (action === 'Sign Up') {
                  handleSignup();
                } else {
                  handleLogin();
                }
              }}
            >
              {action === 'Sign Up' ? 'Sign Up' : 'Login'}
            </div>
            <div
              className={action === 'Login' ? 'submit gray' : 'submit'}
              onClick={() => setAction(action === 'Login' ? 'Sign Up' : 'Login')}
            >
              {action === 'Login' ? 'Sign Up' : 'Login'}
            </div>
          </div>
          <div className="forgot-password">
            <span onClick={() => setForgotPassword(true)}>Forgot Password?</span>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginSignup;*/
// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import user_icon from './person.png';
import email_icon from './email.png';
import password_icon from './password.png';
import show_icon from './show.png';
import hide_icon from './hide.png';


const LoginSignup = ({ onLogin }) => {
  const [action, setAction] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    let isValid = true;

    if (email === '') {
      setEmailError('Please enter your email.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (password === '') {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (action === 'Sign Up' && name === '') {
      setEmailError('Please enter your name.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        onLogin();
        navigate('/'); // Redirect to the main page after successful login
      } else {
        setPasswordError(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setPasswordError('Server error, please try again later.');
    }
  };

  const handleSignup = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful');
        setAction('Login'); // Switch back to Login mode after successful signup
      } else {
        setPasswordError(data.message);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setPasswordError('Server error, please try again later.');
    }
  };

  // Function to navigate to the UserLogin page
  const goToUserLogin = () => {
    navigate('/user-login'); // Make sure the route to UserLogin is defined in your Router
  };

  return (
    <div className="container">
      {forgotPassword ? (
        <div className="forgot-password-content">Forgot Password Section</div>
      ) : (
        <>
          <div className="header">
            <div className="text">{action}</div>
            <div className="underline"></div>
          </div>
          <div className="inputs">
            {action === 'Sign Up' && (
              <div className="input">
                <img src={user_icon} alt="" />
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="input">
              <img src={email_icon} alt="" />
              <input
                type="email"
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {emailError && <div className="error-message">{emailError}</div>}
            <div className="input password-input-container">
              <img src={password_icon} alt="" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <img
                src={showPassword ? hide_icon : show_icon}
                alt="toggle visibility"
                className="show-password-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}
          </div>
          <div className="submit-container">
            <div
              className={action === 'Login' ? 'submit gray' : 'submit'}
              onClick={() => {
                if (action === 'Sign Up') {
                  handleSignup();
                } else {
                  handleLogin();
                }
              }}
            >
              {action === 'Sign Up' ? 'Sign Up' : 'Login'}
            </div>
            <div
              className={action === 'Login' ? 'submit gray' : 'submit'}
              onClick={() => setAction(action === 'Login' ? 'Sign Up' : 'Login')}
            >
              {action === 'Login' ? 'Sign Up' : 'Login'}
            </div>
            <button onClick={() => navigate('/admin-login')}>Go to User Portal</button>
          </div>
          <div className="forgot-password">
            <span onClick={() => setForgotPassword(true)}>Forgot Password?</span>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginSignup;
