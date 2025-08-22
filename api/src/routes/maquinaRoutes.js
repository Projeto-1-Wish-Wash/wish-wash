const { Router } = require('express');
const maquinaController = require('../controllers/maquinaController');
const { authenticateToken, verifyLaundryOwnership } = require('../middleware/auth');

const router = Router();

// Rotas protegidas (todas requerem autenticação)

// CREATE: Criar nova máquina (apenas proprietário)
router.post('/', authenticateToken, maquinaController.create);

// READ: Listar máquinas por lavanderia (proprietário ou público para visualização)
router.get('/lavanderia/:lavanderiaId', maquinaController.getMaquinasByLavanderia);

// READ: Obter contagem de status por lavanderia (público para mapa)
router.get('/lavanderia/:lavanderiaId/status', maquinaController.getStatusCount);

// READ: Buscar máquina por ID
router.get('/:id', maquinaController.getMaquinaById);

// UPDATE: Atualizar status da máquina (proprietário pode tudo, cliente só pode reservar)
router.put('/:id/status', authenticateToken, maquinaController.updateStatus);

// UPDATE: Atualizar dados da máquina (apenas proprietário)
router.put('/:id', authenticateToken, maquinaController.update);

// DELETE: Deletar máquina (apenas proprietário)
router.delete('/:id', authenticateToken, maquinaController.delete);

// DEBUG: Listar todas as máquinas (temporário para debug)
router.get('/debug/all', maquinaController.debugGetAllMaquinas);

module.exports = router;
