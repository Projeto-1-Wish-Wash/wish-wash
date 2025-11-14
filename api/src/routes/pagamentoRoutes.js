const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/pagamentoController');
const auth = require('../middleware/auth');

const controller = new PagamentoController();

// Todas as rotas requerem autenticação
router.use(auth);

// Processar pagamento de um agendamento
router.post('/processar', controller.processar.bind(controller));

// Verificar status de pagamento de um agendamento
router.get('/verificar/:agendamento_id', controller.verificar.bind(controller));

module.exports = router;

