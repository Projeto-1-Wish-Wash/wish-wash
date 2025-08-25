const { Router } = require('express');
const supportController = require('../controllers/supportController');

const router = Router();

// Rota para receber a solicitação de suporte
router.post('/', supportController.handleSupportRequest);

module.exports = router;