const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const HistoricoService = require('./historicoService');

class PagamentoService {
  /**
   * Processa um pagamento para um agendamento
   * @param {Object} dadosPagamento - { agendamento_id, valor, metodo_pagamento }
   * @returns {Promise<Object>} - Resultado do pagamento
   */
  async processarPagamento({ agendamento_id, valor, metodo_pagamento = 'simulado' }) {
    // Buscar agendamento com máquina e lavanderia
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamento_id },
      include: {
        maquina: {
          include: {
            lavanderia: true
          }
        },
        usuario: true
      }
    });

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    if (agendamento.status === 'pago') {
      throw new Error('Este agendamento já foi pago');
    }

    if (agendamento.status !== 'ativo') {
      throw new Error(`Agendamento não está ativo. Status atual: ${agendamento.status}`);
    }

    // Validar valor
    const valorEsperado = agendamento.maquina.valor_lavagem;
    if (!valorEsperado || valorEsperado <= 0) {
      throw new Error('Máquina não possui valor de lavagem configurado');
    }

    if (Math.abs(valor - valorEsperado) > 0.01) {
      throw new Error(`Valor incorreto. Esperado: R$ ${valorEsperado.toFixed(2).replace('.', ',')}, recebido: R$ ${valor.toFixed(2).replace('.', ',')}`);
    }

    // Simular processamento de pagamento
    // Em produção, aqui seria feita a integração com gateway de pagamento
    const pagamentoProcessado = await this.simularProcessamentoPagamento({
      valor,
      metodo_pagamento,
      agendamento_id
    });

    if (!pagamentoProcessado.sucesso) {
      throw new Error(pagamentoProcessado.mensagem || 'Falha no processamento do pagamento');
    }

    // Atualizar agendamento como pago (usando transação)
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar agendamento - adicionar campos de pagamento no status ou criar campo separado
      // Por enquanto, vamos usar o status para indicar que foi pago
      // Em uma versão futura, podemos adicionar campos específicos ao schema
      const agendamentoAtualizado = await tx.agendamento.update({
        where: { id: agendamento_id },
        data: {
          status: 'pago' // Novo status para agendamento pago
        }
      });

      // Criar histórico de lavagem
      const historico = await HistoricoService.createHistorico({
        usuario_id: agendamento.usuario_id,
        lavanderia_id: agendamento.maquina.lavanderia_id,
        maquina_id: agendamento.maquina_id,
        data: agendamento.inicio, // Data do agendamento
        valor: valor
      });

      return {
        agendamento: agendamentoAtualizado,
        historico,
        pagamento: {
          id: pagamentoProcessado.id,
          valor,
          metodo_pagamento,
          status: 'aprovado',
          data_processamento: new Date()
        }
      };
    });

    return resultado;
  }

  /**
   * Simula o processamento de pagamento
   * Em produção, aqui seria feita a integração com gateway (Stripe, PagSeguro, etc)
   */
  async simularProcessamentoPagamento({ valor, metodo_pagamento, agendamento_id }) {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validações básicas
    if (!valor || valor <= 0) {
      return {
        sucesso: false,
        mensagem: 'Valor inválido'
      };
    }

    // Simular falha aleatória (5% de chance) - apenas para testes
    // Em produção, remover esta lógica
    const falhaAleatoria = Math.random() < 0.05;
    if (falhaAleatoria) {
      return {
        sucesso: false,
        mensagem: 'Falha no processamento do pagamento. Tente novamente.'
      };
    }

    // Simular sucesso
    return {
      sucesso: true,
      id: `pay_${Date.now()}_${agendamento_id}`,
      mensagem: 'Pagamento processado com sucesso'
    };
  }

  /**
   * Verifica se um agendamento já foi pago
   */
  async verificarPagamento(agendamento_id) {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamento_id },
      select: {
        id: true,
        status: true,
        maquina: {
          select: {
            valor_lavagem: true
          }
        }
      }
    });

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    return {
      pago: agendamento.status === 'pago',
      valor: agendamento.maquina.valor_lavagem
    };
  }
}

module.exports = PagamentoService;

