import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css';

function History() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avaliandoItem, setAvaliandoItem] = useState(null);
  const navigate = useNavigate();

  // Função para fechar e voltar ao mapa
  const handleClose = () => {
    navigate('/map');
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

  /**
   * Função para avaliar um item do histórico
   */
  const avaliarHistorico = async (historicoId, avaliacao) => {
    try {
      const { token } = getUserAuthData();
      if (!token) {
        alert('Você precisa estar logado para avaliar');
        return;
      }

      setAvaliandoItem(historicoId);

      const response = await fetch(`/api/historico-lavagens/${historicoId}/avaliar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avaliacao })
      });

      if (response.ok) {
        // Atualizar o item no estado local
        setHistorico(prevHistorico => 
          prevHistorico.map(item => 
            item.id === historicoId 
              ? { ...item, avaliacao_usuario: avaliacao }
              : item
          )
        );
        
        // Recarregar dados das lavanderias no mapa se a função estiver disponível
        if (typeof window !== 'undefined' && window.recarregarLavanderias) {
          try {
            window.recarregarLavanderias();
          } catch (error) {
            console.warn('Erro ao recarregar lavanderias no mapa:', error);
          }
        }
        
        alert(`Avaliação de ${avaliacao} estrela${avaliacao > 1 ? 's' : ''} registrada com sucesso!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Erro ao registrar avaliação');
      }
    } catch (error) {
      console.error('Erro ao avaliar histórico:', error);
      alert('Erro de conexão ao avaliar. Tente novamente.');
    } finally {
      setAvaliandoItem(null);
    }
  };

  /**
   * Componente para renderizar estrelas de avaliação
   */
  const renderEstrelas = (item) => {
    if (item.avaliacao_usuario) {
      // Já foi avaliado - mostrar apenas a avaliação
      return (
        <div className="avaliacao-existente">
          <p><strong>Sua avaliação:</strong></p>
          <div className="estrelas-display">
            {[1, 2, 3, 4, 5].map(num => (
              <span 
                key={num} 
                className={`estrela ${num <= item.avaliacao_usuario ? 'ativa' : ''}`}
              >
                ★
              </span>
            ))}
            <span className="avaliacao-texto">({item.avaliacao_usuario} estrela{item.avaliacao_usuario > 1 ? 's' : ''})</span>
          </div>
        </div>
      );
    } else {
      // Não foi avaliado - mostrar opções para avaliar
      return (
        <div className="avaliacao-pendente">
          <p><strong>Avalie esta lavanderia:</strong></p>
          <div className="estrelas-interativas">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                className={`estrela-btn ${avaliandoItem === item.id ? 'desabilitada' : ''}`}
                onClick={() => avaliarHistorico(item.id, num)}
                disabled={avaliandoItem === item.id}
                title={`Dar ${num} estrela${num > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
            {avaliandoItem === item.id && (
              <span className="avaliando-texto">Avaliando...</span>
            )}
          </div>
        </div>
      );
    }
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

        const response = await fetch(`/api/historico-lavagens/usuario/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || `Erro ao carregar histórico (status: ${response.status})`);
        }

        // json.historico contém a lista de registros
        setHistorico(json.historico || []);
      } catch (e) {
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
          // Converte a data para o formato pt-BR no fuso horário do Brasil
          const dataFormatada = item.data ? new Date(item.data).toLocaleDateString('pt-BR', { 
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '';
          // Nome da(s) máquina(s)
          const nomeMaquina = item.maquina?.nome || item.maquina || '---';
          // Valor formatado
          const valorFormatado = item.valor !== null && item.valor !== undefined
            ? item.valor.toFixed(2).replace('.', ',')
            : null;
          return (
            <div key={item.id} className="history-item">
              <h2>{nomeLavanderia}</h2>
              <p><strong>Data:</strong> {dataFormatada}</p>
              <p><strong>Máquina:</strong> {nomeMaquina}</p>
              {valorFormatado !== null && (
                <p className="item-valor"><strong>Valor:</strong> R$ {valorFormatado}</p>
              )}
              <div className="avaliacao-section">
                {renderEstrelas(item)}
              </div>
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
      {content}
    </div>
  );
}

export default History;