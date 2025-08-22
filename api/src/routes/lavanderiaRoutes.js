const { Router } = require('express');
const lavanderiaController = require('../controllers/lavanderiaController');
const { authenticateToken, verifyUserAccess, verifyLaundryOwnership } = require('../middleware/auth');

const router = Router();

// Rotas públicas
// CREATE: Criar lavanderia com proprietário (cadastro público)
router.post('/', lavanderiaController.create);

// READ: Listar todas as lavanderias (mapa público)
router.get('/', lavanderiaController.getAllLavanderias);

// READ: Buscar lavanderia por ID (público para visualização no mapa)
router.get('/:id', lavanderiaController.getLavanderiaById);

// Rotas protegidas (requerem autenticação)
// READ: Buscar lavanderias por proprietário (apenas o próprio proprietário)
router.get('/proprietario/:proprietarioId', authenticateToken, verifyUserAccess, lavanderiaController.getLavanderiasByProprietario);

// UPDATE: Atualizar lavanderia (apenas o proprietário da lavanderia)
router.put('/:id', authenticateToken, verifyLaundryOwnership, lavanderiaController.updateLavanderia);

// DELETE: Deletar lavanderia (apenas o proprietário da lavanderia)
router.delete('/:id', authenticateToken, verifyLaundryOwnership, lavanderiaController.deleteLavanderia);

module.exports = router;