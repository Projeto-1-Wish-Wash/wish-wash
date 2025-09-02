const AvaliacaoService = require('../services/avaliacaoService');

class AvaliacaoController {
  constructor() {
    this.avaliacaoService = new AvaliacaoService();
  }

  async criarAvaliacao(req, res) {
    try {
      const { lavanderia_id, nota, comentario } = req.body;
      const usuario_id = req.user.id;

      if (!lavanderia_id || !nota) {
        return res.status(400).json({ success: false, message: 'Lavanderia ID e nota são obrigatórios' });
      }
      if (nota < 1 || nota > 5) {
        return res.status(400).json({ success: false, message: 'A nota deve ser entre 1 e 5' });
      }

      const podeAvaliar = await this.avaliacaoService.verificarUsoLavanderia(usuario_id, lavanderia_id);
      if (!podeAvaliar) {
        return res.status(403).json({ success: false, message: 'Você só pode avaliar lavanderias que já utilizou' });
      }

      const avaliacao = await this.avaliacaoService.criarAvaliacao({ usuario_id, lavanderia_id, nota, comentario });
      res.status(201).json({ success: true, message: 'Avaliação criada/atualizada com sucesso', data: avaliacao });
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  async buscarAvaliacaoUsuario(req, res) {
    try {
      const { lavanderia_id } = req.params;
      const usuario_id = req.user.id;
      const avaliacao = await this.avaliacaoService.buscarAvaliacaoUsuario(usuario_id, parseInt(lavanderia_id));
      res.status(200).json({ success: true, data: avaliacao });
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  async listarAvaliacoesLavanderia(req, res) {
    try {
      const { lavanderia_id } = req.params;
      const avaliacoes = await this.avaliacaoService.listarAvaliacoesLavanderia(parseInt(lavanderia_id));
      res.status(200).json({ success: true, data: avaliacoes });
    } catch (error) {
      console.error('Erro ao listar avaliações:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  async deletarAvaliacao(req, res) {
    try {
      const { avaliacao_id } = req.params;
      const usuario_id = req.user.id;
      const resultado = await this.avaliacaoService.deletarAvaliacao(parseInt(avaliacao_id), usuario_id);
      res.status(200).json({ success: true, message: resultado.message });
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      if (error.message.includes('não encontrada') || error.message.includes('não autorizada')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }

  async verificarPodeAvaliar(req, res) {
    try {
      const { lavanderia_id } = req.params;
      const usuario_id = req.user.id;
      const podeAvaliar = await this.avaliacaoService.verificarUsoLavanderia(usuario_id, parseInt(lavanderia_id));
      res.status(200).json({ success: true, data: { podeAvaliar, lavanderia_id: parseInt(lavanderia_id) } });
    } catch (error) {
      console.error('Erro ao verificar se pode avaliar:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
    }
  }
}

module.exports = AvaliacaoController;
