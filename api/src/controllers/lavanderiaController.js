const lavanderiaService = require('../services/lavanderiaService');

class LavanderiaController {
  async create(req, res) {
    // dados do usuário e da lavanderia
    const { dadosUsuario, dadosLavanderia } = req.body;

    // Validação de entrada
    if (!dadosUsuario || !dadosLavanderia) {
      return res.status(400).json({ error: 'Estrutura de dados inválida. São necessários "dadosUsuario" e "dadosLavanderia".' });
    }
    if (!dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.senha || !dadosLavanderia.nome) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
      const resultado = await lavanderiaService.createProprietarioComLavanderia(
        dadosUsuario,
        dadosLavanderia
      );
      // Remove a senha do objeto de resposta
      delete resultado.proprietario.senha_hash;

      res.status(201).json(resultado);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ error: 'Este email já está cadastrado.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor ao criar lavanderia.' });
    }
  }

  // READ: Listar todas as lavanderias
  async getAllLavanderias(req, res) {
    try {
      const lavanderias = await lavanderiaService.getAllLavanderias();
      res.status(200).json(lavanderias);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // READ: Buscar lavanderia por ID
  async getLavanderiaById(req, res) {
    const { id } = req.params;

    try {
      const lavanderia = await lavanderiaService.getLavanderiaById(id);
      if (!lavanderia) {
        return res.status(404).json({ error: 'Lavanderia não encontrada.' });
      }
      res.status(200).json(lavanderia);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // READ: Buscar lavanderias por proprietário
  async getLavanderiasByProprietario(req, res) {
    const { proprietarioId } = req.params;

    try {
      const lavanderias = await lavanderiaService.getLavanderiasByProprietario(proprietarioId);
      res.status(200).json(lavanderias);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // UPDATE: Atualizar lavanderia
  async updateLavanderia(req, res) {
    const { id } = req.params;
    const { nome, endereco, telefone } = req.body;

    try {
      const lavanderiaAtualizada = await lavanderiaService.updateLavanderia(id, { nome, endereco, telefone });
      res.status(200).json(lavanderiaAtualizada);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Lavanderia não encontrada.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // DELETE: Deletar lavanderia
  async deleteLavanderia(req, res) {
    const { id } = req.params;

    try {
      const lavanderiaDeletada = await lavanderiaService.deleteLavanderia(id);
      res.status(200).json({ message: 'Lavanderia deletada com sucesso.', lavanderia: lavanderiaDeletada });
    } catch (error) {
      if (error.message === 'Lavanderia não encontrada') {
        return res.status(404).json({ error: 'Lavanderia não encontrada.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new LavanderiaController();