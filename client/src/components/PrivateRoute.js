import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      if (!token || !userString) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(userString);
        // Armazena o usuário do localStorage primeiro para uma verificação rápida
        setUser(userData); 
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        const res = await fetch(`${API_URL}/api/usuarios/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Se a API diz que o token é inválido, limpa tudo
          localStorage.clear();
          setUser(null);
        }
        // Se a resposta for OK, o usuário que já setamos do localStorage é válido.

      } catch (err) {
        localStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) {
    return <div>Verificando autenticação...</div>;
  }

  // 1. Verifica se está autenticado
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Verifica se o papel (tipo_usuario) do usuário está na lista de permitidos
  if (allowedRoles && !allowedRoles.includes(user.tipo_usuario)) {
    // Se não tiver permissão, redireciona para a sua página padrão
    const defaultRedirectPath = user.tipo_usuario === 'proprietario' ? '/laundry-profile' : '/map';
    return <Navigate to={defaultRedirectPath} />;
  }
  
  // Se passou em todas as verificações, mostra a página
  return children;
};

export default PrivateRoute;