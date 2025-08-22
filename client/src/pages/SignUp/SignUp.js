import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddressInput from '../../components/AddressInput';
import './SignUp.css'; // Estilos específicos para a página de cadastro

const SignUp = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [endereco, setEndereco] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função para receber coordenadas do AddressInput
  const handleCoordinatesChange = (newCoordinates) => {
    setCoordinates(newCoordinates);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = {
        nome,
        email,
        senha: password,
        endereco,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        tipo_usuario: 'cliente', // Por padrão, cadastra como cliente
      };

      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar conta.');
      }
      
      alert('Conta criada com sucesso! Você será redirecionado para o login.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">Criar Conta</h1>
        <p className="signup-subtitle">Junte-se ao WISH WASH hoje.</p>
        
        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
          <div className="input-group">
            <AddressInput
              value={endereco}
              onChange={setEndereco}
              onCoordinatesChange={handleCoordinatesChange}
              placeholder="Digite seu endereço completo ou CEP"
              required
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="signup-button">
            Cadastrar
          </button>
        </form>
        
        <div className="login-link">
          <p>Já tem uma conta? <Link to="/login">Fazer Login.</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
