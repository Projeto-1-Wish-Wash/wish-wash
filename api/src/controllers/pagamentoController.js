const PagamentoService = require('../services/pagamentoService');

class PagamentoController {
  constructor() {
    this.service = new PagamentoService();
  }

  /**
   * POST /api/pagamentos/processar
   * Processa pagamento de um agendamento
   */
  async processar(req, res) {
    try {
      const { agendamento_id, valor, metodo_pagamento } = req.body;
      const usuario_id = req.user.id;

      if (!agendamento_id || !valor) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: agendamento_id, valor'
        });
      }

      // Verificar se o agendamento pertence ao usuário
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const agendamento = await prisma.agendamento.findUnique({
        where: { id: Number(agendamento_id) },
        select: { usuario_id: true }
      });

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      if (agendamento.usuario_id !== usuario_id) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para pagar este agendamento'
        });
      }

      const resultado = await this.service.processarPagamento({
        agendamento_id: Number(agendamento_id),
        valor: parseFloat(valor),
        metodo_pagamento: metodo_pagamento || 'simulado'
      });

      res.status(200).json({
        success: true,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao processar pagamento'
      });
    }
  }

  /**
   * GET /api/pagamentos/verificar/:agendamento_id
   * Verifica status de pagamento de um agendamento
   */
  async verificar(req, res) {
    try {
      const { agendamento_id } = req.params;
      const usuario_id = req.user.id;

      // Verificar se o agendamento pertence ao usuário
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const agendamento = await prisma.agendamento.findUnique({
        where: { id: Number(agendamento_id) },
        select: { usuario_id: true }
      });

      if (!agendamento) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      if (agendamento.usuario_id !== usuario_id) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para verificar este agendamento'
        });
      }

      const status = await this.service.verificarPagamento(Number(agendamento_id));

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao verificar pagamento'
      });
    }
  }
}

module.exports = PagamentoController;

