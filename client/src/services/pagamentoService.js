class PagamentoService {
  /**
   * Processa pagamento de um agendamento
   * @param {Object} dadosPagamento - { agendamento_id, valor, metodo_pagamento }
   * @returns {Promise<Object>} - Resultado do pagamento
   */
  async processarPagamento(dadosPagamento) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/pagamentos/processar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosPagamento),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Verifica status de pagamento de um agendamento
   * @param {number} agendamentoId - ID do agendamento
   * @returns {Promise<Object>} - Status do pagamento
   */
  async verificarPagamento(agendamentoId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/pagamentos/verificar/${agendamentoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao verificar pagamento');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw error;
    }
  }
}

export default new PagamentoService();

