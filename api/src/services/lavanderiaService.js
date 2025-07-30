const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');

class LavanderiaService {
  /**
   * Cria um novo usuário proprietário e sua lavanderia em uma única transação.
   */
  async createProprietarioComLavanderia(dadosUsuario, dadosLavanderia) {
    const resultado = await prisma.$transaction(async (tx) => {
      // Criptografa a senha do usuário
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(dadosUsuario.senha, salt);

      // cria o usuário do tipo proprietario
      // Usa 'tx' em vez de prisma para garantir que a operação
      // faça parte da transação.
      const novoProprietario = await tx.usuario.create({
        data: {
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          senha_hash: senha_hash,
          tipo_usuario: 'proprietario', // Força o tipo correto
        },
      });

      // usa o ID do proprietário recém-criado para criar a lavanderia
      const novaLavanderia = await tx.lavanderia.create({
        data: {
          nome: dadosLavanderia.nome,
          endereco: dadosLavanderia.endereco,
          telefone: dadosLavanderia.telefone,
          proprietario_id: novoProprietario.id, // Link com o proprietário
        },
      });

      // retorna os dados criados
      return { proprietario: novoProprietario, lavanderia: novaLavanderia };
    });

    // O Prisma garante que se qualquer passo acima falhar, tudo é desfeito rollback
    return resultado;
  }

  // READ: Listar todas as lavanderias
  async getAllLavanderias() {
    const lavanderias = await prisma.lavanderia.findMany({
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
    return lavanderias;
  }

  // READ: Buscar lavanderia por ID
  async getLavanderiaById(id) {
    const lavanderia = await prisma.lavanderia.findUnique({
      where: { id: parseInt(id) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo_usuario: true,
          },
        },
      },
    });
    return lavanderia;
  }

  // READ: Buscar lavanderias por proprietário
  async getLavanderiasByProprietario(proprietarioId) {
    const lavanderias = await prisma.lavanderia.findMany({
      where: { proprietario_id: parseInt(proprietarioId) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
    return lavanderias;
  }

  // UPDATE: Atualizar lavanderia
  async updateLavanderia(id, { nome, endereco, telefone }) {
    const dataToUpdate = {};
    
    if (nome) dataToUpdate.nome = nome;
    if (endereco !== undefined) dataToUpdate.endereco = endereco; // permite string vazia
    if (telefone !== undefined) dataToUpdate.telefone = telefone; // permite string vazia

    const lavanderiaAtualizada = await prisma.lavanderia.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return lavanderiaAtualizada;
  }

  // DELETE: Deletar lavanderia
  async deleteLavanderia(id) {
    // Verifica se a lavanderia existe
    const lavanderia = await prisma.lavanderia.findUnique({
      where: { id: parseInt(id) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!lavanderia) {
      throw new Error('Lavanderia não encontrada');
    }

    const lavanderiaDeletada = await prisma.lavanderia.delete({
      where: { id: parseInt(id) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return lavanderiaDeletada;
  }
}

module.exports = new LavanderiaService();