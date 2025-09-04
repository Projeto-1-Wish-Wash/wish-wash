const prisma = require('../../prisma/client');

/**
 * Serviço para manipular o histórico de lavagens.
 * Fornece métodos para criar e consultar registros de histórico ligados a usuários
 * e lavanderias. Utiliza o Prisma Client para acessar o banco de dados.
 */
class HistoricoService {
  /**
   * Cria um novo registro de histórico de lavagem.
   *
   * @param {Object} historicoData - Dados para criação do histórico
   * @param {number} historicoData.usuario_id - ID do usuário
   * @param {number} historicoData.lavanderia_id - ID da lavanderia
   * @param {number|null} historicoData.maquina_id - ID da máquina (opcional)
   * @param {Date|string|null} historicoData.data - Data e hora da lavagem (padrão: agora)
   * @param {number|null} historicoData.valor - Valor cobrado pela lavagem
   * @returns {Promise<Object>} Registro criado
   */
  async createHistorico(historicoData) {
    const {
      usuario_id,
      lavanderia_id,
      maquina_id = null,
      data = new Date(), // Data e hora da lavagem
      valor = null
    } = historicoData;

    // Garantir tipos corretos
    const parsedUsuarioId = parseInt(usuario_id);
    const parsedLavanderiaId = parseInt(lavanderia_id);
    const parsedMaquinaId = maquina_id !== null && maquina_id !== undefined ? parseInt(maquina_id) : null;

   

    const newHistorico = await prisma.historicoLavagem.create({
      data: {
        usuario_id: parsedUsuarioId,
        lavanderia_id: parsedLavanderiaId,
        maquina_id: parsedMaquinaId,
        data: data instanceof Date ? data : new Date(data),
        valor: valor !== null && valor !== undefined ? parseFloat(valor) : null
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true }
        },
        lavanderia: {
          select: { id: true, nome: true }
        },
        maquina: {
          select: { id: true, nome: true }
        }
      }
    });


    return newHistorico;
  }

  /**
   * Atualiza a avaliação de um histórico de lavagem específico.
   *
   * @param {number} historicoId - ID do histórico
   * @param {number} userId - ID do usuário (para verificação de propriedade)
   * @param {number} avaliacao - Avaliação de 1 a 5 estrelas
   * @returns {Promise<Object>} Histórico atualizado
   */
  async avaliarHistorico(historicoId, userId, avaliacao) {
    // Validar a avaliação
    if (avaliacao < 1 || avaliacao > 5 || !Number.isInteger(avaliacao)) {
      throw new Error('Avaliação deve ser um número inteiro entre 1 e 5');
    }

    // Verificar se o histórico existe e pertence ao usuário
    const historico = await prisma.historicoLavagem.findFirst({
      where: {
        id: parseInt(historicoId),
        usuario_id: parseInt(userId)
      },
      include: {
        lavanderia: true
      }
    });

    if (!historico) {
      throw new Error('Histórico não encontrado ou não pertence a este usuário');
    }

    // Atualizar a avaliação no histórico
    const historicoAtualizado = await prisma.historicoLavagem.update({
      where: { id: parseInt(historicoId) },
      data: { avaliacao_usuario: avaliacao },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true }
        },
        lavanderia: {
          select: { id: true, nome: true }
        },
        maquina: {
          select: { id: true, nome: true }
        }
      }
    });

    // Recalcular a média de avaliação da lavanderia
    await this.recalcularAvaliacaoLavanderia(historico.lavanderia_id);

    return historicoAtualizado;
  }

  /**
   * Recalcula a avaliação média de uma lavanderia baseada nas avaliações dos usuários
   *
   * @param {number} lavanderiaId - ID da lavanderia
   * @returns {Promise<void>}
   */
  async recalcularAvaliacaoLavanderia(lavanderiaId) {
    // Buscar todas as avaliações válidas para esta lavanderia
    const avaliacoes = await prisma.historicoLavagem.findMany({
      where: {
        lavanderia_id: parseInt(lavanderiaId),
        avaliacao_usuario: { not: null }
      },
      select: { avaliacao_usuario: true }
    });

    if (avaliacoes.length === 0) {
      // Se não há avaliações, deixar como null
      await prisma.lavanderia.update({
        where: { id: parseInt(lavanderiaId) },
        data: { avaliacao: null }
      });
    } else {
      // Calcular média
      const soma = avaliacoes.reduce((acc, curr) => acc + curr.avaliacao_usuario, 0);
      const media = parseFloat((soma / avaliacoes.length).toFixed(1));
      
      // Atualizar a média na lavanderia
      await prisma.lavanderia.update({
        where: { id: parseInt(lavanderiaId) },
        data: { avaliacao: media }
      });
    }
  }

  /**
   * Retorna todos os registros de histórico de lavagem de um usuário específico.
   *
   * @param {number} usuarioId - ID do usuário
   * @returns {Promise<Array>} Lista de registros de histórico
   */
  async getHistoricoByUsuario(usuarioId) {
    const parsedUsuarioId = parseInt(usuarioId);

    const historicos = await prisma.historicoLavagem.findMany({
      where: {
        usuario_id: parsedUsuarioId
      },
      orderBy: {
        data: 'desc'
      },
      include: {
        lavanderia: {
          select: {
            id: true,
            nome: true
          }
        },
        maquina: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return historicos;
  }

  /**
   * Retorna todos os registros de histórico de lavagem de uma lavanderia específica.
   *
   * @param {number} lavanderiaId - ID da lavanderia
   * @returns {Promise<Array>} Lista de registros de histórico
   */
  async getHistoricoByLavanderia(lavanderiaId) {
    const parsedLavanderiaId = parseInt(lavanderiaId);

    const historicos = await prisma.historicoLavagem.findMany({
      where: {
        lavanderia_id: parsedLavanderiaId
      },
      orderBy: {
        data: 'desc'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        maquina: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return historicos;
  }
}

module.exports = new HistoricoService();