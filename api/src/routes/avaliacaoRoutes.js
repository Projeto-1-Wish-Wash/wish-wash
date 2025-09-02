const express = require('express');
const router = express.Router();
const AvaliacaoController = require('../controllers/avaliacaoController');
const authMiddleware = require('../middleware/auth');

const avaliacaoController = new AvaliacaoController();

router.use(authMiddleware);

router.post('/', avaliacaoController.criarAvaliacao.bind(avaliacaoController));
router.get('/lavanderia/:lavanderia_id', avaliacaoController.listarAvaliacoesLavanderia.bind(avaliacaoController));
router.get('/usuario/:lavanderia_id', avaliacaoController.buscarAvaliacaoUsuario.bind(avaliacaoController));
router.get('/verificar/:lavanderia_id', avaliacaoController.verificarPodeAvaliar.bind(avaliacaoController));
router.delete('/:avaliacao_id', avaliacaoController.deletarAvaliacao.bind(avaliacaoController));

module.exports = router;
