const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

// POST: Criar novo usuário (cadastro)
router.post('/', userController.create);

// POST: Fazer login
router.post('/login', userController.login);

// GET: Listar todos os usuários
router.get('/', userController.getAllUsers);

// GET: Buscar usuário por ID
router.get('/:id', userController.getUserById);

// PUT: Atualizar usuário
router.put('/:id', userController.updateUser);

// DELETE: Deletar usuário
router.delete('/:id', userController.deleteUser);

module.exports = router;
