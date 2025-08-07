import React, { useState, useEffect } from 'react';
import './History.css';

function History() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaundries = async () => {
      try {
        // Substitua esta URL pela URL real da sua API de histórico de lavagens
        // Por enquanto, vamos simular alguns dados
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              {
                id: 1,
                lavanderia: 'Lavanderia Central',
                data: '2024-07-15',
                tipo: 'Lavagem',
                maquina: 'Máquina 3',
                status: 'Concluída',
                valor: 15.00
              },
              {
                id: 2,
                lavanderia: 'WashMax Bodocongó',
                data: '2024-07-10',
                tipo: 'Secagem',
                maquina: 'Secadora 1',
                status: 'Concluída',
                valor: 10.00
              },
              {
                id: 3,
                lavanderia: 'Clean Express Catolé',
                data: '2024-07-01',
                tipo: 'Lavagem e Secagem',
                maquina: 'Máquina 5, Secadora 2',
                status: 'Concluída',
                valor: 25.00
              },
              {
                id: 4,
                lavanderia: 'Lava Rápido Liberdade',
                data: '2024-06-25',
                tipo: 'Lavagem',
                maquina: 'Máquina 2',
                status: 'Concluída',
                valor: 12.00
              },
              {
                id: 5,
                lavanderia: 'AquaWash Universitário',
                data: '2024-06-20',
                tipo: 'Secagem',
                maquina: 'Secadora 3',
                status: 'Concluída',
                valor: 8.00
              }
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

  if (loading) {
    return <div className="history-container">Carregando histórico...</div>;
  }

  if (error) {
    return <div className="history-container">Erro ao carregar histórico: {error.message}</div>;
  }

  return (
    <div className="history-container">
      <h1>Histórico de Lavagens</h1>
      {laundries.length === 0 ? (
        <p>Nenhuma lavagem encontrada no histórico.</p>
      ) : (
        <div className="history-list">
          {laundries.map(item => (
            <div key={item.id} className="history-item">
              <h2>{item.lavanderia}</h2>
              <p><strong>Data:</strong> {item.data}</p>
              <p><strong>Tipo:</strong> {item.tipo}</p>
              <p><strong>Máquina(s):</strong> {item.maquina}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Valor:</strong> R$ {item.valor.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;