const userService = require('../services/userService');

class UserController {
  async createUser(req, res) {
    const { nome, email, senha, tipo_usuario } = req.body;

    // Validação básica de entrada
    if (!nome || !email || !senha || !tipo_usuario) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
      const novoUsuario = await userService.createUser({ nome, email, senha, tipo_usuario });
      res.status(201).json(novoUsuario);
    } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
          }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // READ: Listar todos os usuários
  async getAllUsers(req, res) {
    try {
      const usuarios = await userService.getAllUsers();
      res.status(200).json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // READ: Buscar usuário por ID
  async getUserById(req, res) {
    const { id } = req.params;

    try {
      const usuario = await userService.getUserById(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      res.status(200).json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // UPDATE: Atualizar usuário
  async updateUser(req, res) {
    const { id } = req.params;
    const { nome, email, senha, tipo_usuario } = req.body;

    try {
      const usuarioAtualizado = await userService.updateUser(id, { nome, email, senha, tipo_usuario });
      res.status(200).json(usuarioAtualizado);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ error: 'Este email já está cadastrado.' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // DELETE: Deletar usuário
  async deleteUser(req, res) {
    const { id } = req.params;

    try {
      const usuarioDeletado = await userService.deleteUser(id);
      res.status(200).json({ message: 'Usuário deletado com sucesso.', usuario: usuarioDeletado });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      if (error.message === 'Não é possível deletar proprietário que possui lavanderias') {
        return res.status(400).json({ error: 'Não é possível deletar proprietário que possui lavanderias.' });
      }
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new UserController();