const supportService = require('../services/supportService');
const { supportSchema } = require('../validation/supportValidation');

class SupportController {
  async handleSupportRequest(req, res) {
    try {
      // Valida os dados de entrada
      const { error } = supportSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ erro: error.details[0].message });
      }

      const { nome, email, mensagem } = req.body;

      // Processa a solicitação
      await supportService.processSupportRequest({ nome, email, mensagem });

      res.status(200).json({ mensagem: 'Solicitação de suporte enviada com sucesso' });

    } catch (error) {
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new SupportController();