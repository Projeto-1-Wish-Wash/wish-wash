const { Router } = require('express');
const userRoutes = require('./userRoutes');
const lavanderiaRoutes = require('./lavanderiaRoutes');

const router = Router();

// Monta as rotas de usuário com o prefixo /usuarios
router.use('/usuarios', userRoutes);
router.use('/lavanderias', lavanderiaRoutes);

module.exports = router;