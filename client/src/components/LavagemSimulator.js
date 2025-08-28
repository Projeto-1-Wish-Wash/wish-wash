import React, { useState } from 'react';
import HistoricoService from '../services/historicoService';
import './LavagemSimulator.css';

function LavagemSimulator({ onHistoricoCriado }) {
  const [formData, setFormData] = useState({
    usuario_id: '',
    lavanderia_id: '',
    maquina_id: '',
    tipo: 'Lavagem',
    valor: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Erro: Usuário não autenticado');
        return;
      }

      // Simula a conclusão de uma lavagem
      const novoHistorico = await HistoricoService.simularLavagemConcluida(formData, token);
      
      setMessage('Lavagem concluída e histórico criado com sucesso!');
      
      // Limpa o formulário
      setFormData({
        usuario_id: '',
        lavanderia_id: '',
        maquina_id: '',
        tipo: 'Lavagem',
        valor: ''
      });

      // Notifica o componente pai para atualizar a lista
      if (onHistoricoCriado) {
        onHistoricoCriado(novoHistorico);
      }

      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lavagem-simulator">
      <h3>Simular Conclusão de Lavagem</h3>
      
      {message && (
        <div className={`message ${message.includes('Erro') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="simulator-form">
        <div className="form-group">
          <label htmlFor="usuario_id">ID do Usuário:</label>
          <input
            type="number"
            id="usuario_id"
            name="usuario_id"
            value={formData.usuario_id}
            onChange={handleInputChange}
            required
            placeholder="Ex: 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lavanderia_id">ID da Lavanderia:</label>
          <input
            type="number"
            id="lavanderia_id"
            name="lavanderia_id"
            value={formData.lavanderia_id}
            onChange={handleInputChange}
            required
            placeholder="Ex: 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="maquina_id">ID da Máquina (opcional):</label>
          <input
            type="number"
            id="maquina_id"
            name="maquina_id"
            value={formData.maquina_id}
            onChange={handleInputChange}
            placeholder="Ex: 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo de Serviço:</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
          >
            <option value="Lavagem">Lavagem</option>
            <option value="Secagem">Secagem</option>
            <option value="Lavagem e Secagem">Lavagem e Secagem</option>
            <option value="Passagem">Passagem</option>
            <option value="Limpeza a Seco">Limpeza a Seco</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="valor">Valor (R$):</label>
          <input
            type="number"
            id="valor"
            name="valor"
            value={formData.valor}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="Ex: 15.50"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Concluir Lavagem'}
        </button>
      </form>
    </div>
  );
}

export default LavagemSimulator;
