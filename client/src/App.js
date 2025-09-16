import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import PrivateRoute from './components/PrivateRoute';

// Importando as páginas
import CreateLaundry from './pages/CreateLaundry/CreateLaundry';
import Dashboard from './pages/Dashboard/Dashboard';
import History from './pages/History/History';
import LaundryProfile from './pages/LaundryProfile/LaundryProfile';
import Login from './pages/Login/Login';
import Map from './pages/Map/Map';
import Profile from './pages/Profile/Profile';
import SignUp from './pages/SignUp/SignUp';
import Support from './pages/Support/Support';


function App() {

  const isAuthenticated = () => localStorage.getItem('token') !== null;
  const getUserType = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).tipo_usuario : null;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota padrão redireciona baseado no tipo de usuário */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? (
                getUserType() === 'proprietario' ? 
                  <Navigate replace to="/laundry-profile" /> : 
                  <Navigate replace to="/map" />
              ) : (
                <Navigate replace to="/login" />
              )
            } 
          />
          
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/create-laundry" element={<CreateLaundry />} />
          <Route path="/support" element={<Support />} />
          
          {/* Rotas Privadas */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute allowedRoles={['cliente']}>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <PrivateRoute allowedRoles={['cliente']}>
                <Map />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <PrivateRoute allowedRoles={['cliente']}>
                <History />
              </PrivateRoute>
            } 
          />
           <Route 
            path="/profile" 
            element={
              <PrivateRoute allowedRoles={['cliente']}>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/laundry-profile" 
            element={
              <PrivateRoute allowedRoles={['proprietario']}>
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
