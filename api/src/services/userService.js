const bcrypt = require('bcryptjs');

const prisma = require('../../prisma/client');

class UserService {
  async createUser({ nome, email, senha, tipo_usuario }) {
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(senha, salt);

    // Prisma Client para criar o usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash,
        tipo_usuario,
      },
      // Seleciona quais campos retornar (para não vazar a senha_hash)
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
      },
    });

    return novoUsuario;
  }

  // READ: Listar todos os usuários
  async getAllUsers() {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true,
      },
    });
    return usuarios;
  }

  // READ: Buscar usuário por ID
  async getUserById(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true,
        lavanderias: {
          select: {
            id: true,
            nome: true,
            endereco: true,
            telefone: true,
          },
        },
      },
    });
    return usuario;
  }

  // UPDATE: Atualizar usuário
  async updateUser(id, { nome, email, senha, tipo_usuario }) {
    const dataToUpdate = {};
    
    if (nome) dataToUpdate.nome = nome;
    if (email) dataToUpdate.email = email;
    if (tipo_usuario) dataToUpdate.tipo_usuario = tipo_usuario;
    
    // Se uma nova senha foi fornecida, hash ela
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.senha_hash = await bcrypt.hash(senha, salt);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
        createdAt: true,
      },
    });

    return usuarioAtualizado;
  }

  // DELETE: Deletar usuário
  async deleteUser(id) {
    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { lavanderias: true },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Se o usuário é proprietário e tem lavanderias, não pode ser deletado
    if (usuario.tipo_usuario === 'proprietario' && usuario.lavanderias.length > 0) {
      throw new Error('Não é possível deletar proprietário que possui lavanderias');
    }

    const usuarioDeletado = await prisma.usuario.delete({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_usuario: true,
      },
    });

    return usuarioDeletado;
  }
}

module.exports = new UserService();