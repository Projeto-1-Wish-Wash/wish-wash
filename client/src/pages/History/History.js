import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoricoService from '../../services/historicoService';
import LavagemSimulator from '../../components/LavagemSimulator';
import './History.css';

function History() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Função para fechar e voltar ao mapa
  const handleClose = () => {
    navigate('/map');
  };

  // Função para atualizar a lista quando um novo histórico é criado
  const handleHistoricoCriado = (novoHistorico) => {
    setHistorico(prev => [novoHistorico, ...prev]);
  };

  /**
   * Recupera o token e o ID do usuário armazenados no localStorage.
   * Retorna um objeto com `token` e `userId` ou valores nulos caso não exista.
   */
  const getUserAuthData = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return { token, userId: user?.id };
  };

  // Busca o histórico de lavagens do usuário autenticado
  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const { token, userId } = getUserAuthData();
        // Se não houver token ou usuário, redireciona para login
        if (!token || !userId) {
          navigate('/login');
          return;
        }

        // Usa o serviço para buscar o histórico
        const historicoData = await HistoricoService.getHistoricoByUsuario(userId, token);
        setHistorico(historicoData);
      } catch (e) {
        console.error('Erro ao buscar histórico:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
    // Dependências incluem navigate para redirecionar corretamente se token estiver ausente
  }, [navigate]);

  // Lógica para renderizar o conteúdo dinamicamente
  let content;
  if (loading) {
    content = <div className="loading-message">Carregando histórico...</div>;
  } else if (error) {
    content = <div className="error-message">Erro ao carregar histórico: {error.message}</div>;
  } else if (!historico || historico.length === 0) {
    content = <p>Nenhuma lavagem encontrada no histórico.</p>;
  } else {
    content = (
      <div className="history-list">
        {historico.map(item => {
          // Nome da lavanderia
          const nomeLavanderia = item.lavanderia?.nome || item.lavanderia || 'Lavanderia desconhecida';
          // Converte a data para o formato pt-BR
          const dataFormatada = item.data ? new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
          // Nome da(s) máquina(s)
          const nomeMaquina = item.maquina?.nome || item.maquina || '---';
          // Tipo
          const tipo = item.tipo || '---';
          // Status
          const status = item.status || '---';
          // Valor formatado
          const valorFormatado = item.valor !== null && item.valor !== undefined
            ? item.valor.toFixed(2).replace('.', ',')
            : null;
          return (
            <div key={item.id} className="history-item">
              <h2>{nomeLavanderia}</h2>
              <p><strong>Data:</strong> {dataFormatada}</p>
              <p><strong>Tipo:</strong> {tipo}</p>
              <p><strong>Máquina:</strong> {nomeMaquina}</p>
              <p><strong>Status:</strong> <span className="status-completed">{status}</span></p>
              {valorFormatado !== null && (
                <p className="item-valor"><strong>Valor:</strong> R$ {valorFormatado}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Return unificado para que o botão sempre apareça
  return (
    <div className="history-container">
      <button onClick={handleClose} className="close-button">
        &times;
      </button>
      <h1>Histórico de Lavagens</h1>
      
      {/* Simulador para criar histórico de lavagens */}
      <LavagemSimulator onHistoricoCriado={handleHistoricoCriado} />
      
      {/* Lista de histórico */}
      {content}
    </div>
  );
}

export default History;