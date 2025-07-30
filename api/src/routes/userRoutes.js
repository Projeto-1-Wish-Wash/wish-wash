const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

// CREATE: Criar usuário
router.post('/', userController.createUser);

// READ: Listar todos os usuários
router.get('/', userController.getAllUsers);

// READ: Buscar usuário por ID
router.get('/:id', userController.getUserById);

// UPDATE: Atualizar usuário
router.put('/:id', userController.updateUser);

// DELETE: Deletar usuário
router.delete('/:id', userController.deleteUser);

module.exports = router;