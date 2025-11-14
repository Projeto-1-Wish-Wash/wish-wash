import React, { useState, useEffect } from 'react';
import pagamentoService from '../services/pagamentoService';
import './PagamentoModal.css';

const PagamentoModal = ({ isOpen, onClose, agendamento, maquina, lavanderia, onSuccess }) => {
  const [metodoPagamento, setMetodoPagamento] = useState('simulado');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagamentoVerificado, setPagamentoVerificado] = useState(false);
  const [jaPago, setJaPago] = useState(false);

  // Verificar se o agendamento já foi pago quando o modal abrir
  useEffect(() => {
    if (isOpen && agendamento?.id) {
      verificarStatusPagamento();
    }
  }, [isOpen, agendamento?.id]);

  const verificarStatusPagamento = async () => {
    try {
      const status = await pagamentoService.verificarPagamento(agendamento.id);
      setJaPago(status.pago);
      setPagamentoVerificado(true);
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
      setPagamentoVerificado(true); // Continuar mesmo com erro
    }
  };

  if (!isOpen || !agendamento || !maquina) return null;

  const valor = maquina.valor_lavagem || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (valor <= 0) {
      setError('Valor inválido para pagamento');
      return;
    }

    if (jaPago) {
      setError('Este agendamento já foi pago.');
      return;
    }

    if (!agendamento?.id) {
      setError('Agendamento inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resultado = await pagamentoService.processarPagamento({
        agendamento_id: agendamento.id,
        valor: valor,
        metodo_pagamento: metodoPagamento,
      });

      if (onSuccess) {
        onSuccess(resultado);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="pagamento-modal-overlay" onClick={() => !loading && onClose()}>
      <div className="pagamento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pagamento-modal-header">
          <h2>Finalizar Pagamento</h2>
          <button
            className="pagamento-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="pagamento-modal-content">
          {jaPago && (
            <div className="alert-success">
              ✅ Este agendamento já foi pago e está confirmado.
            </div>
          )}

          <div className="resumo-agendamento">
            <h3>Resumo do Agendamento</h3>
            <div className="resumo-item">
              <span className="resumo-label">Máquina:</span>
              <span className="resumo-value">{maquina.nome}</span>
            </div>
            {maquina.capacidade && (
              <div className="resumo-item">
                <span className="resumo-label">Capacidade:</span>
                <span className="resumo-value">{maquina.capacidade}</span>
              </div>
            )}
            {lavanderia && (
              <div className="resumo-item">
                <span className="resumo-label">Lavanderia:</span>
                <span className="resumo-value">{lavanderia.nome}</span>
              </div>
            )}
            <div className="resumo-item">
              <span className="resumo-label">Data/Hora:</span>
              <span className="resumo-value">
                {formatarData(agendamento.inicio)} - {formatarData(agendamento.fim)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="pagamento-form">
            <div className="valor-section">
              <label>Valor Total</label>
              <div className="valor-display">
                R$ {valor.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div className="metodo-section">
              <label htmlFor="metodo">Método de Pagamento</label>
              <select
                id="metodo"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                disabled={loading}
                required
              >
                <option value="simulado">Pagamento Simulado (Teste)</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
              </select>
              <p className="metodo-hint">
                💡 Em produção, aqui seria integrado com gateway de pagamento (Stripe, PagSeguro, etc)
              </p>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="pagamento-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || valor <= 0 || jaPago || !pagamentoVerificado}
              >
                {loading ? 'Processando...' : jaPago ? 'Já Pago' : 'Confirmar Pagamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PagamentoModal;

