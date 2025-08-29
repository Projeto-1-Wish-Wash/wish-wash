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