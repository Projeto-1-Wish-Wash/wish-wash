const maquinaService = require('../services/maquinaService');
const historicoService = require('../services/historicoService');

class MaquinaController {
  /**
   * POST /api/maquinas - Criar nova máquina
   */
  async create(req, res) {
    try {
      const { nome, capacidade, valor_lavagem, observacoes, lavanderia_id } = req.body;

      // Validação básica
      if (!nome || !lavanderia_id) {
        return res.status(400).json({
          error: 'Nome da máquina e ID da lavanderia são obrigatórios'
        });
      }

      // Validação do valor da lavagem
      if (valor_lavagem !== undefined && (isNaN(valor_lavagem) || valor_lavagem < 0)) {
        return res.status(400).json({
          error: 'Valor da lavagem deve ser um número positivo'
        });
      }

      const novaMaquina = await maquinaService.createMaquina({
        nome,
        capacidade,
        valor_lavagem,
        observacoes,
        lavanderia_id
      });

      res.status(201).json({
        message: 'Máquina criada com sucesso',
        maquina: novaMaquina
      });

    } catch (error) {
      console.error('Erro ao criar máquina:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /api/maquinas/lavanderia/:lavanderiaId - Listar máquinas de uma lavanderia
   */
  async getMaquinasByLavanderia(req, res) {
    try {
      const { lavanderiaId } = req.params;

      if (!lavanderiaId || isNaN(lavanderiaId)) {
        return res.status(400).json({
          error: 'ID da lavanderia deve ser um número válido'
        });
      }

      const maquinas = await maquinaService.getMaquinasByLavanderia(lavanderiaId);

      res.status(200).json({
        maquinas: maquinas,
        total: maquinas.length
      });

    } catch (error) {
      console.error('Erro ao buscar máquinas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /api/maquinas/:id - Buscar máquina por ID
   */
  async getMaquinaById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID da máquina deve ser um número válido'
        });
      }

      const maquina = await maquinaService.getMaquinaById(id);

      res.status(200).json({
        maquina: maquina
      });

    } catch (error) {
      console.error('Erro ao buscar máquina:', error);

      if (error.message === 'Máquina não encontrada') {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * PUT /api/maquinas/:id/status - Atualizar status da máquina
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, horario_reserva } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID da máquina deve ser um número válido'
        });
      }

      if (!status) {
        return res.status(400).json({
          error: 'Status é obrigatório'
        });
      }

      // Buscar a máquina para verificar o proprietário
      const maquina = await maquinaService.getMaquinaById(id);
      const userIdFromToken = req.user.userId;
      const userType = req.user.tipo_usuario;

      // Verificar permissões baseadas no tipo de usuário
      if (userType === 'proprietario') {
        // Proprietário pode alterar para qualquer status, mas só de suas próprias máquinas
        if (maquina.lavanderia.proprietario_id !== userIdFromToken) {
          return res.status(403).json({
            error: 'Você só pode alterar o status das máquinas de suas próprias lavanderias'
          });
        }
      } else if (userType === 'cliente') {
        // Cliente só pode reservar máquinas (alterar de disponivel para em_uso)
        if (status !== 'em_uso') {
          return res.status(403).json({
            error: 'Clientes só podem reservar máquinas (alterar status para "em uso")'
          });
        }

        if (maquina.status !== 'disponivel') {
          return res.status(400).json({
            error: 'Só é possível reservar máquinas que estão disponíveis'
          });
        }
      } else {
        return res.status(403).json({
          error: 'Tipo de usuário não autorizado'
        });
      }

      const maquinaAtualizada = await maquinaService.updateStatusMaquina(id, status);

      // Se um cliente está reservando a máquina (mudando para em_uso), criar registro no histórico
      if (userType === 'cliente' && status === 'em_uso') {
        try {
          // Obter data/hora atual no fuso horário do Brasil
          const horaLavagem = new Date();
          
          // Formatar para exibição no log
          const horaFormatadaBrasil = horaLavagem.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Sao_Paulo'
          });
          
          const novoHistorico = await historicoService.createHistorico({
            usuario_id: userIdFromToken,
            lavanderia_id: maquina.lavanderia.id,
            maquina_id: parseInt(id),
            data: horaLavagem, // Data e hora da lavagem
            horario_reserva: horario_reserva, // Horário selecionado pelo cliente
            valor: maquina.valor_lavagem
          });
          
        } catch (historicoError) {
          // Log detalhado do erro para debug
          console.error('❌ Erro ao criar histórico de reserva:', historicoError);
          console.error('📋 Stack trace:', historicoError.stack);
        }
      }

      res.status(200).json({
        message: 'Status da máquina atualizado com sucesso',
        maquina: maquinaAtualizada
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);

      if (error.message.includes('Status inválido') || error.message === 'Máquina não encontrada') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * PUT /api/maquinas/:id - Atualizar dados da máquina
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, capacidade, valor_lavagem, observacoes, status } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID da máquina deve ser um número válido'
        });
      }

      // Pelo menos um campo deve ser fornecido
      if (!nome && capacidade === undefined && valor_lavagem === undefined && observacoes === undefined && !status) {
        return res.status(400).json({
          error: 'Pelo menos um campo deve ser fornecido para atualização'
        });
      }

      // Validação do valor da lavagem
      if (valor_lavagem !== undefined && (isNaN(valor_lavagem) || valor_lavagem < 0)) {
        return res.status(400).json({
          error: 'Valor da lavagem deve ser um número positivo'
        });
      }

      const maquinaAtualizada = await maquinaService.updateMaquina(id, {
        nome,
        capacidade,
        valor_lavagem,
        observacoes,
        status
      });

      res.status(200).json({
        message: 'Máquina atualizada com sucesso',
        maquina: maquinaAtualizada
      });

    } catch (error) {
      console.error('Erro ao atualizar máquina:', error);

      if (error.message.includes('Status inválido') || error.message === 'Máquina não encontrada') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * DELETE /api/maquinas/:id - Deletar máquina
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID da máquina deve ser um número válido'
        });
      }

      const maquinaDeletada = await maquinaService.deleteMaquina(id);

      res.status(200).json({
        message: 'Máquina deletada com sucesso',
        maquina: maquinaDeletada
      });

    } catch (error) {
      console.error('Erro ao deletar máquina:', error);

      if (error.message === 'Máquina não encontrada') {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /api/maquinas/lavanderia/:lavanderiaId/status - Obter contagem por status
   */
  async getStatusCount(req, res) {
    try {
      const { lavanderiaId } = req.params;

      if (!lavanderiaId || isNaN(lavanderiaId)) {
        return res.status(400).json({
          error: 'ID da lavanderia deve ser um número válido'
        });
      }

      const contagem = await maquinaService.getStatusCount(lavanderiaId);

      res.status(200).json({
        contagem: contagem
      });

    } catch (error) {
      console.error('Erro ao buscar contagem:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * DEBUG: GET /api/maquinas/debug/all - Listar todas as máquinas (temporário)
   */
  async debugGetAllMaquinas(req, res) {
    try {      
      const prisma = require('../../prisma/client');
      const todasMaquinas = await prisma.maquinaDeLavar.findMany({
        include: {
          lavanderia: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      res.status(200).json({
        total: todasMaquinas.length,
        maquinas: todasMaquinas
      });

    } catch (error) {
      console.error('💥 DEBUG: Erro ao buscar todas as máquinas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new MaquinaController();
