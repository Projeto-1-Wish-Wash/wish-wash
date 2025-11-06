class AgendamentoService {
  /**
   * Busca horários disponíveis para uma máquina em uma data específica
   * @param {number} maquinaId - ID da máquina
   * @param {string} date - Data no formato YYYY-MM-DD
   * @param {number} intervaloMin - Intervalo em minutos (padrão: 60)
   * @returns {Promise<Object>} - Objeto com slots disponíveis
   */
  async listarHorariosDisponiveis(maquinaId, date, intervaloMin = 60) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/maquinas/${maquinaId}/horarios?date=${date}&intervaloMin=${intervaloMin}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao buscar horários disponíveis');
      }

      const data = await response.json();
      return data.data || { slots: [], intervaloMin, janela: {} };
    } catch (error) {
      console.error('Erro ao listar horários disponíveis:', error);
      throw error;
    }
  }

  /**
   * Cria um novo agendamento
   * @param {Object} agendamentoData - Dados do agendamento { maquina_id, inicio, fim }
   * @returns {Promise<Object>} - Agendamento criado
   */
  async criarAgendamento(agendamentoData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(agendamentoData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao criar agendamento');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  /**
   * Lista agendamentos de uma máquina em uma data específica
   * @param {number} maquinaId - ID da máquina
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} - Lista de agendamentos
   */
  async listarAgendamentosPorData(maquinaId, date) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/agendamentos/maquina/${maquinaId}?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao buscar agendamentos');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      throw error;
    }
  }
}

export default new AgendamentoService();

