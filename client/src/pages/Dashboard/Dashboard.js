import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Função para fechar e voltar ao mapa
  const handleClose = () => {
    navigate('/map');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force redirect and page refresh
  };

  // Hook para lidar com o redirecionamento de forma correta
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      // Limpa o timer se o componente for desmontado
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);


  if (!user) {
    return (
      <div className="dashboard-container">
        {/* O botão é incluído aqui também para consistência */}
        <button onClick={handleClose} className="close-button">&times;</button>
        <p>Você não está logado. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/*Botão para fechar a tela */}
      <button onClick={handleClose} className="close-button">
        &times;
      </button>

      <div className="dashboard-box">
        <h1 className="dashboard-title">Bem-vindo, {user.nome}!</h1>
        <div className="user-info">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Tipo de Usuário:</strong> {user.tipo_usuario}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </div>
    </div>
  );
};

export default Dashboard;