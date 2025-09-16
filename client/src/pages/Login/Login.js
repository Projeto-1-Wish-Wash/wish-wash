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
      // Define a URL base da API a partir da variável de ambiente
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/usuarios/login`, { // Usa a URL completa
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

      // Redirecionar baseado no tipo de usuário
      if (data.user.tipo_usuario === 'proprietario') {
        navigate('/laundry-profile');
      } else {
        navigate('/map');
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">WISH WASH</h1>
        <p className="login-subtitle">Faça login com uma conta para continuar.</p>
        
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
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            Log in com email
          </button>
        </form>
        
        <div className="or-separator">
          <span>ou</span>
        </div>
        
        <div className="alternative-actions">
          <p>Não tem uma conta? <Link to="/signup">Sign Up.</Link></p>
          <Link to="/create-laundry" className="setup-link">Registre sua lavanderia aqui</Link>
          <p className="help-link">Precisa de ajuda? <span><Link to ="/support"> Fale com o suporte</Link></span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
