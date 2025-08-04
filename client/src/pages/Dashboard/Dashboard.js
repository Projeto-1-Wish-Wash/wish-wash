import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force redirect and page refresh
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <p>You are not logged in. Redirecting...</p>
        {/* Add redirect if user accesses directly */}
        {setTimeout(() => (window.location.href = '/login'), 2000)}
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1 className="dashboard-title">Welcome, {user.nome}!</h1>
        <div className="user-info">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User Type:</strong> {user.tipo_usuario}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
