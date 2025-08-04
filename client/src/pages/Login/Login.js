import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Estilos para a página de login

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      // Save token and user data to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to dashboard and force page refresh
      // for private route logic to work correctly
      navigate('/dashboard');
      window.location.reload();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">WISH WASH</h1>
        <p className="login-subtitle">Log In with an account to continue.</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            Log in with email
          </button>
        </form>
        
        <div className="or-separator">
          <span>or</span>
        </div>
        
        <div className="alternative-actions">
          <p>Don't have an account? <Link to="/signup">Sign Up.</Link></p>
          <Link to="/create-laundry" className="setup-link">Register your laundry now</Link>
          <p className="help-link">Do you need help? <span>Chat with Support</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
