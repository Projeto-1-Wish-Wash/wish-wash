import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importando as páginas
import CreateLaundry from './pages/CreateLaundry/CreateLaundry';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Profile from './pages/Profile/Profile';
import LaundryProfile from './pages/LaundryProfile/LaundryProfile';

// Helper para verificar se o usuário está autenticado
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Componente de Rota Privada
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota padrão redireciona para o dashboard se logado, senão para o login */}
          <Route 
            path="/" 
            element={isAuthenticated() ? <Navigate replace to="/dashboard" /> : <Navigate replace to="/login" />} 
          />
          
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/create-laundry" element={<CreateLaundry />} />
          
          {/* Rotas Privadas */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/laundry-profile" 
            element={
              <PrivateRoute>
                <LaundryProfile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
