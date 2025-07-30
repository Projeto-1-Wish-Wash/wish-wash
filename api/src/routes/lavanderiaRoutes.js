const { Router } = require('express');
const lavanderiaController = require('../controllers/lavanderiaController');

const router = Router();

// CREATE: Criar lavanderia com proprietário
router.post('/', lavanderiaController.create);

// READ: Listar todas as lavanderias
router.get('/', lavanderiaController.getAllLavanderias);

// READ: Buscar lavanderias por proprietário
router.get('/proprietario/:proprietarioId', lavanderiaController.getLavanderiasByProprietario);

// READ: Buscar lavanderia por ID
router.get('/:id', lavanderiaController.getLavanderiaById);

// UPDATE: Atualizar lavanderia
router.put('/:id', lavanderiaController.updateLavanderia);

// DELETE: Deletar lavanderia
router.delete('/:id', lavanderiaController.deleteLavanderia);

module.exports = router;