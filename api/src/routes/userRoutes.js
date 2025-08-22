const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, verifyUserAccess } = require('../middleware/auth');

const router = Router();

// Rotas públicas (sem autenticação)
// POST: Criar novo usuário (cadastro)
router.post('/', userController.create);

// POST: Fazer login
router.post('/login', userController.login);

// Rotas protegidas (requerem autenticação)
// GET: Listar todos os usuários (apenas para administração)
router.get('/', authenticateToken, userController.getAllUsers);

// GET: Buscar usuário por ID (apenas o próprio usuário)
router.get('/:id', authenticateToken, verifyUserAccess, userController.getUserById);

// PUT: Atualizar usuário (apenas o próprio usuário)
router.put('/:id', authenticateToken, verifyUserAccess, userController.updateUser);

// DELETE: Deletar usuário (apenas o próprio usuário)
router.delete('/:id', authenticateToken, verifyUserAccess, userController.deleteUser);

module.exports = router;
