const prisma = require('../../prisma/client');

class MaquinaService {
  /**
   * Cria uma nova máquina para uma lavanderia
   * @param {Object} maquinaData - Dados da máquina {nome, capacidade, observacoes, lavanderia_id}
   * @returns {Promise<Object>} - Máquina criada
   */
  async createMaquina(maquinaData) {
    const { nome, capacidade, valor_lavagem, observacoes, lavanderia_id } = maquinaData;

    const novaMaquina = await prisma.maquinaDeLavar.create({
      data: {
        nome,
        capacidade,
        valor_lavagem: valor_lavagem ? parseFloat(valor_lavagem) : null,
        observacoes,
        lavanderia_id: parseInt(lavanderia_id),
        status: 'disponivel'
      },
      include: {
        lavanderia: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return novaMaquina;
  }

  /**
   * Lista todas as máquinas de uma lavanderia
   * @param {number} lavanderiaId - ID da lavanderia
   * @returns {Promise<Array>} - Lista de máquinas
   */
  async getMaquinasByLavanderia(lavanderiaId) {
    const maquinas = await prisma.maquinaDeLavar.findMany({
      where: {
        lavanderia_id: parseInt(lavanderiaId)
      },
      orderBy: {
        nome: 'asc'
      },
      include: {
        lavanderia: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return maquinas;
  }

  /**
   * Busca uma máquina por ID
   * @param {number} maquinaId - ID da máquina
   * @returns {Promise<Object>} - Dados da máquina
   */
  async getMaquinaById(maquinaId) {
    const maquina = await prisma.maquinaDeLavar.findUnique({
      where: {
        id: parseInt(maquinaId)
      },
      include: {
        lavanderia: {
          select: {
            id: true,
            nome: true,
            proprietario_id: true
          }
        }
      }
    });

    if (!maquina) {
      throw new Error('Máquina não encontrada');
    }

    return maquina;
  }

  /**
   * Atualiza o status de uma máquina
   * @param {number} maquinaId - ID da máquina
   * @param {string} novoStatus - Novo status (disponivel, em_uso, manutencao)
   * @returns {Promise<Object>} - Máquina atualizada
   */
  async updateStatusMaquina(maquinaId, novoStatus) {
    // Validar status
    const statusValidos = ['disponivel', 'em_uso', 'manutencao'];
    if (!statusValidos.includes(novoStatus)) {
      throw new Error('Status inválido. Use: disponivel, em_uso ou manutencao');
    }

    const maquinaAtualizada = await prisma.maquinaDeLavar.update({
      where: {
        id: parseInt(maquinaId)
      },
      data: {
        status: novoStatus,
        updatedAt: new Date()
      },
      include: {
        lavanderia: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return maquinaAtualizada;
  }

  /**
   * Atualiza dados de uma máquina
   * @param {number} maquinaId - ID da máquina
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} - Máquina atualizada
   */
  async updateMaquina(maquinaId, updateData) {
    const { nome, capacidade, valor_lavagem, observacoes, status } = updateData;
    const dataToUpdate = {};

    if (nome) dataToUpdate.nome = nome;
    if (capacidade !== undefined) dataToUpdate.capacidade = capacidade;
    if (valor_lavagem !== undefined) dataToUpdate.valor_lavagem = valor_lavagem ? parseFloat(valor_lavagem) : null;
    if (observacoes !== undefined) dataToUpdate.observacoes = observacoes;
    if (status) {
      const statusValidos = ['disponivel', 'em_uso', 'manutencao'];
      if (!statusValidos.includes(status)) {
        throw new Error('Status inválido. Use: disponivel, em_uso ou manutencao');
      }
      dataToUpdate.status = status;
    }

    dataToUpdate.updatedAt = new Date();

    const maquinaAtualizada = await prisma.maquinaDeLavar.update({
      where: {
        id: parseInt(maquinaId)
      },
      data: dataToUpdate,
      include: {
        lavanderia: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return maquinaAtualizada;
  }

  /**
   * Deleta uma máquina
   * @param {number} maquinaId - ID da máquina
   * @returns {Promise<Object>} - Máquina deletada
   */
  async deleteMaquina(maquinaId) {
    const maquina = await this.getMaquinaById(maquinaId);

    const maquinaDeletada = await prisma.maquinaDeLavar.delete({
      where: {
        id: parseInt(maquinaId)
      }
    });

    return maquinaDeletada;
  }

  /**
   * Conta máquinas por status em uma lavanderia
   * @param {number} lavanderiaId - ID da lavanderia
   * @returns {Promise<Object>} - Contagem por status
   */
  async getStatusCount(lavanderiaId) {
    const contagem = await prisma.maquinaDeLavar.groupBy({
      by: ['status'],
      where: {
        lavanderia_id: parseInt(lavanderiaId)
      },
      _count: {
        status: true
      }
    });

    // Formatar resultado
    const resultado = {
      disponivel: 0,
      em_uso: 0,
      manutencao: 0,
      total: 0
    };

    contagem.forEach(item => {
      resultado[item.status] = item._count.status;
      resultado.total += item._count.status;
    });

    return resultado;
  }
}

module.exports = new MaquinaService();
