import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css';

function History() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); //Inicializa o hook de navegação

  // Função para fechar e voltar ao mapa
  const handleClose = () => {
    navigate('/map');
  };

  useEffect(() => {
    const fetchLaundries = async () => {
      try {
        // Simulação de chamada à API
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              // dados de exemplo aqui...
              { id: 1, lavanderia: 'Lavanderia Central', data: '2025-08-10', tipo: 'Lavagem', maquina: 'Máquina 3', status: 'Concluída', valor: 15.00 },
              { id: 2, lavanderia: 'WashMax Bodocongó', data: '2025-08-05', tipo: 'Secagem', maquina: 'Secadora 1', status: 'Concluída', valor: 10.00 },
              { id: 3, lavanderia: 'Clean Express Catolé', data: '2025-07-28', tipo: 'Lavagem e Secagem', maquina: 'Máquina 5, Secadora 2', status: 'Concluída', valor: 25.00 },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLaundries(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLaundries();
  }, []);

  // Lógica para renderizar o conteúdo dinamicamente
  let content;
  if (loading) {
    content = <div className="loading-message">Carregando histórico...</div>;
  } else if (error) {
    content = <div className="error-message">Erro ao carregar histórico: {error.message}</div>;
  } else if (laundries.length === 0) {
    content = <p>Nenhuma lavagem encontrada no histórico.</p>;
  } else {
    content = (
      <div className="history-list">
        {laundries.map(item => (
          <div key={item.id} className="history-item">
            <h2>{item.lavanderia}</h2>
            <p><strong>Data:</strong> {new Date(item.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
            <p><strong>Tipo:</strong> {item.tipo}</p>
            <p><strong>Máquina(s):</strong> {item.maquina}</p>
            <p><strong>Status:</strong> <span className="status-completed">{item.status}</span></p>
            <p className="item-valor"><strong>Valor:</strong> R$ {item.valor.toFixed(2).replace('.', ',')}</p>
          </div>
        ))}
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