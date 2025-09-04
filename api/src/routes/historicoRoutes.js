const { Router } = require('express');
const historicoController = require('../controllers/historicoController');
const { authenticateToken } = require('../middleware/auth');

// Roteador para as rotas de histórico de lavagens
const router = Router();

/**
 * POST /api/historico-lavagens
 * Cria um novo registro de histórico. Esta rota não utiliza autenticação porque
 * pode ser chamada internamente pelo sistema (por exemplo, quando uma lavagem
 * é concluída). Caso deseje restringir essa rota, adicione authenticateToken.
 */
router.post('/', historicoController.createHistorico);

/**
 * GET /api/historico-lavagens/usuario/:usuarioId
 * Lista todos os registros de histórico de um usuário. Requer autenticação
 * para garantir que o usuário só acesse seu próprio histórico.
 */
router.get('/usuario/:usuarioId', authenticateToken, historicoController.getHistoricoByUsuario);

/**
 * PUT /api/historico-lavagens/:id/avaliar
 * Permite ao usuário avaliar uma lavanderia através de um histórico específico.
 * Requer autenticação e verifica se o histórico pertence ao usuário.
 */
router.put('/:id/avaliar', authenticateToken, historicoController.avaliarHistorico);

module.exports = router;