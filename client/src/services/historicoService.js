import API_CONFIG from '../config/api';

class HistoricoService {
  /**
   * Busca o histórico de lavagens de um usuário específico
   * @param {number} userId - ID do usuário
   * @param {string} token - Token de autenticação
   * @returns {Promise<Array>} Lista de registros de histórico
   */
  static async getHistoricoByUsuario(userId, token) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/historico-lavagens/usuario/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.historico || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de histórico de lavagem
   * @param {Object} historicoData - Dados do histórico
   * @param {string} token - Token de autenticação
   * @returns {Promise<Object>} Registro criado
   */
  static async createHistorico(historicoData, token) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/historico-lavagens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(historicoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.historico;
    } catch (error) {
      console.error('Erro ao criar histórico:', error);
      throw error;
    }
  }

  /**
   * Busca o histórico de lavagens de uma lavanderia específica
   * @param {number} lavanderiaId - ID da lavanderia
   * @param {string} token - Token de autenticação
   * @returns {Promise<Array>} Lista de registros de histórico
   */
  static async getHistoricoByLavanderia(lavanderiaId, token) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/historico-lavagens/lavanderia/${lavanderiaId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.historico || [];
    } catch (error) {
      console.error('Erro ao buscar histórico da lavanderia:', error);
      throw error;
    }
  }

  /**
   * Simula a criação de um histórico quando uma lavagem é concluída
   * @param {Object} lavagemData - Dados da lavagem concluída
   * @param {string} token - Token de autenticação
   * @returns {Promise<Object>} Registro criado
   */
  static async simularLavagemConcluida(lavagemData, token) {
    const historicoData = {
      usuario_id: lavagemData.usuario_id,
      lavanderia_id: lavagemData.lavanderia_id,
      maquina_id: lavagemData.maquina_id || null,
      tipo: lavagemData.tipo || 'Lavagem',
      status: 'Concluída',
      valor: lavagemData.valor || 0,
      data: new Date().toISOString()
    };

    return await this.createHistorico(historicoData, token);
  }
}

export default HistoricoService;
