import React, { useState, useEffect } from 'react';
import './AvaliacaoModal.css';

const AvaliacaoModal = ({ isOpen, onClose, lavanderia, onSubmit, avaliacaoExistente = null }) => {
  const [nota, setNota] = useState(avaliacaoExistente?.nota || 0);
  const [comentario, setComentario] = useState(avaliacaoExistente?.comentario || '');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (avaliacaoExistente) {
      setNota(avaliacaoExistente.nota);
      setComentario(avaliacaoExistente.comentario || '');
    }
  }, [avaliacaoExistente]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nota === 0) return alert('Por favor, selecione uma nota.');
    setIsSubmitting(true);
    try {
      await onSubmit({ lavanderia_id: lavanderia.id, nota, comentario: comentario.trim() || null });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="avaliacao-modal-overlay" onClick={() => !isSubmitting && onClose()}>
      <div className="avaliacao-modal" onClick={(e) => e.stopPropagation()}>
        <div className="avaliacao-modal-header">
          <h2>Avaliar Lavanderia</h2>
          <button className="avaliacao-modal-close" onClick={onClose} disabled={isSubmitting}>×</button>
        </div>

        <div className="avaliacao-modal-content">
          <div className="lavanderia-info">
            <h3>{lavanderia.nome}</h3>
            <p>{lavanderia.endereco}</p>
          </div>

          <form onSubmit={handleSubmit} className="avaliacao-form">
            <div className="rating-section">
              <label>Como você avalia esta lavanderia?</label>
              <div className="stars-container">
                {[1,2,3,4,5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= (hoveredStar || nota) ? 'filled' : ''}`}
                    onClick={() => setNota(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    disabled={isSubmitting}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="rating-text">{nota === 0 ? 'Selecione uma nota' : `${nota} estrela${nota>1?'s':''}`}</span>
            </div>

            <div className="comment-section">
              <label htmlFor="comentario">Comentário (opcional)</label>
              <textarea id="comentario" rows="4" maxLength="500" value={comentario} onChange={(e)=>setComentario(e.target.value)} disabled={isSubmitting} />
              <span className="char-count">{comentario.length}/500</span>
            </div>

            <div className="avaliacao-modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting || nota===0}>{isSubmitting?'Enviando...':(avaliacaoExistente?'Atualizar Avaliação':'Enviar Avaliação')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvaliacaoModal;
