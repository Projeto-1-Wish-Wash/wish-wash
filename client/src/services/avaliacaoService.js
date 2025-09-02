import api from '../config/api';

class AvaliacaoService {
  async criarAvaliacao(dados) {
    const response = await api.post('/avaliacoes', dados);
    return response.data;
  }

  async buscarAvaliacaoUsuario(lavanderiaId) {
    const response = await api.get(`/avaliacoes/usuario/${lavanderiaId}`);
    return response.data;
  }

  async listarAvaliacoesLavanderia(lavanderiaId) {
    const response = await api.get(`/avaliacoes/lavanderia/${lavanderiaId}`);
    return response.data;
  }

  async verificarPodeAvaliar(lavanderiaId) {
    const response = await api.get(`/avaliacoes/verificar/${lavanderiaId}`);
    return response.data;
  }

  async deletarAvaliacao(avaliacaoId) {
    const response = await api.delete(`/avaliacoes/${avaliacaoId}`);
    return response.data;
  }
}

export default new AvaliacaoService();
