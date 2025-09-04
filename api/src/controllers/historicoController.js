const historicoService = require('../services/historicoService');

/**
 * Controller responsável por lidar com as requisições HTTP relacionadas ao
 * histórico de lavagens. Ele valida os parâmetros, verifica permissões e
 * delega a lógica de negócio para o serviço de histórico.
 */
class HistoricoController {
  /**
   * Cria um novo registro de histórico de lavagem.
   * Rota: POST /api/historico-lavagens
   */
  async createHistorico(req, res) {
    try {
      const {
        usuario_id,
        lavanderia_id,
        maquina_id,
        data,
        valor
      } = req.body;

      // Validação mínima de campos obrigatórios
      if (!usuario_id || !lavanderia_id) {
        return res.status(400).json({
          error: 'Campos obrigatórios: usuario_id e lavanderia_id'
        });
      }

      const novoHistorico = await historicoService.createHistorico({
        usuario_id,
        lavanderia_id,
        maquina_id,
        data,
        valor
      });

      res.status(201).json({
        message: 'Histórico criado com sucesso',
        historico: novoHistorico
      });
    } catch (error) {
      console.error('Erro ao criar histórico:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista todos os registros de histórico para um usuário específico.
   * Rota: GET /api/historico-lavagens/usuario/:usuarioId
   */
  async getHistoricoByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      // Garantir que o usuário autenticado só pode acessar seu próprio histórico
      const userIdFromToken = req.user?.userId;
      if (userIdFromToken !== parseInt(usuarioId)) {
        return res.status(403).json({
          error: 'Você só pode acessar o seu próprio histórico'
        });
      }

      const historicos = await historicoService.getHistoricoByUsuario(usuarioId);

      res.status(200).json({
        historico: historicos,
        total: historicos.length
      });
    } catch (error) {
      console.error('Erro ao listar histórico:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza a avaliação de um histórico específico do usuário.
   * Rota: PUT /api/historico-lavagens/:id/avaliar
   */
  async avaliarHistorico(req, res) {
    try {
      const { id } = req.params;
      const { avaliacao } = req.body;
      const userIdFromToken = req.user?.userId;

      // Validação de campos obrigatórios
      if (!avaliacao || !Number.isInteger(avaliacao)) {
        return res.status(400).json({
          error: 'A avaliação deve ser um número inteiro válido'
        });
      }

      if (avaliacao < 1 || avaliacao > 5) {
        return res.status(400).json({
          error: 'A avaliação deve ser entre 1 e 5 estrelas'
        });
      }

      if (!userIdFromToken) {
        return res.status(401).json({
          error: 'Usuário não autenticado'
        });
      }

      const historicoAtualizado = await historicoService.avaliarHistorico(
        parseInt(id), 
        userIdFromToken, 
        avaliacao
      );

      res.status(200).json({
        message: 'Avaliação registrada com sucesso',
        historico: historicoAtualizado
      });
    } catch (error) {
      console.error('Erro ao avaliar histórico:', error);
      
      if (error.message.includes('Avaliação deve ser') || error.message.includes('não encontrado')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new HistoricoController();