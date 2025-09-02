import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css';
import AvaliacaoModal from '../../components/AvaliacaoModal';
import avaliacaoService from '../../services/avaliacaoService';

function History() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [lavanderiaParaAvaliar, setLavanderiaParaAvaliar] = useState(null);
  const [avaliacaoExistente, setAvaliacaoExistente] = useState(null);
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

  // Abrir modal de avaliação
  const handleAbrirAvaliacao = async (lavanderia) => {
    try {
      const podeAvaliar = await avaliacaoService.verificarPodeAvaliar(lavanderia.id);
      if (podeAvaliar.data.podeAvaliar) {
        const avaliacao = await avaliacaoService.buscarAvaliacaoUsuario(lavanderia.id);
        setAvaliacaoExistente(avaliacao.data);
        setLavanderiaParaAvaliar(lavanderia);
        setShowAvaliacaoModal(true);
      } else {
        alert('Você só pode avaliar lavanderias que já utilizou.');
      }
    } catch (error) {
      console.error('Erro ao verificar avaliação:', error);
      alert('Erro ao verificar se pode avaliar. Tente novamente.');
    }
  };

  const handleFecharAvaliacao = () => {
    setShowAvaliacaoModal(false);
    setLavanderiaParaAvaliar(null);
    setAvaliacaoExistente(null);
  };

  const handleEnviarAvaliacao = async (dados) => {
    try {
      await avaliacaoService.criarAvaliacao(dados);
      alert('Avaliação enviada com sucesso!');
      handleFecharAvaliacao();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação.');
    }
  };

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
              {item.lavanderia?.id && (
                <button className="avaliar-button" onClick={() => handleAbrirAvaliacao(item.lavanderia)}>
                  {avaliacaoExistente ? 'Editar Avaliação' : 'Avaliar Lavanderia'}
                </button>
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
      {content}

      {showAvaliacaoModal && lavanderiaParaAvaliar && (
        <AvaliacaoModal
          isOpen={showAvaliacaoModal}
          onClose={handleFecharAvaliacao}
          lavanderia={lavanderiaParaAvaliar}
          onSubmit={handleEnviarAvaliacao}
          avaliacaoExistente={avaliacaoExistente}
        />
      )}
    </div>
  );
}

export default History;