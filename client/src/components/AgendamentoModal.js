import React, { useState, useEffect } from 'react';
import agendamentoService from '../services/agendamentoService';
import './AgendamentoModal.css';

const AgendamentoModal = ({ isOpen, onClose, maquina, lavanderia, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Inicializar data mínima (hoje)
  useEffect(() => {
    if (isOpen && !selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, [isOpen, selectedDate]);

  // Buscar horários disponíveis quando a data mudar
  useEffect(() => {
    if (isOpen && selectedDate && maquina?.id) {
      buscarHorarios();
    }
  }, [selectedDate, isOpen, maquina?.id]);

  const buscarHorarios = async () => {
    if (!selectedDate || !maquina?.id) return;

    setLoadingSlots(true);
    setError('');
    setSelectedSlot(null);
    setSlots([]);

    try {
      const data = await agendamentoService.listarHorariosDisponiveis(
        maquina.id,
        selectedDate,
        60 // Intervalo de 60 minutos
      );

      setSlots(data.slots || []);
      if (data.slots && data.slots.length === 0) {
        setError('Não há horários disponíveis para esta data.');
      }
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setError(err.message || 'Erro ao carregar horários disponíveis.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatarHora = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Por favor, selecione um horário.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const agendamento = await agendamentoService.criarAgendamento({
        maquina_id: maquina.id,
        inicio: selectedSlot.inicio,
        fim: selectedSlot.fim,
      });

      if (onSuccess) {
        onSuccess(agendamento);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError(err.message || 'Erro ao criar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Data mínima: hoje
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="agendamento-modal-overlay" onClick={() => !loading && onClose()}>
      <div className="agendamento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="agendamento-modal-header">
          <h2>Agendar Máquina</h2>
          <button
            className="agendamento-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="agendamento-modal-content">
          {maquina && (
            <div className="maquina-info">
              <h3>{maquina.nome}</h3>
              {maquina.capacidade && <p>Capacidade: {maquina.capacidade}</p>}
              {maquina.valor_lavagem && (
                <p className="price">R$ {maquina.valor_lavagem.toFixed(2).replace('.', ',')}</p>
              )}
              {lavanderia && <p className="lavanderia-name">{lavanderia.nome}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="agendamento-form">
            <div className="date-section">
              <label htmlFor="data">Selecione a data:</label>
              <input
                type="date"
                id="data"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                disabled={loading || loadingSlots}
                required
              />
              {selectedDate && (
                <p className="date-display">{formatarData(selectedDate)}</p>
              )}
            </div>

            <div className="slots-section">
              <label>Selecione o horário:</label>
              {loadingSlots ? (
                <div className="loading-slots">Carregando horários disponíveis...</div>
              ) : error && slots.length === 0 ? (
                <div className="error-message">{error}</div>
              ) : slots.length > 0 ? (
                <div className="slots-grid">
                  {slots.map((slot, index) => {
                    const isSelected = selectedSlot?.inicio === slot.inicio;
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`slot-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={loading}
                      >
                        <span className="slot-time">
                          {formatarHora(slot.inicio)} - {formatarHora(slot.fim)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="no-slots">Nenhum horário disponível</div>
              )}
            </div>

            {error && selectedSlot && (
              <div className="error-message">{error}</div>
            )}

            <div className="agendamento-modal-actions">
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
                disabled={loading || !selectedSlot || loadingSlots}
              >
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoModal;

