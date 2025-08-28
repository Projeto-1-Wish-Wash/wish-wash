const { Router } = require('express');
const userRoutes = require('./userRoutes');
const lavanderiaRoutes = require('./lavanderiaRoutes');
const maquinaRoutes = require('./maquinaRoutes');
const supportRoutes = require('./supportRoutes')
const historicoRoutes = require('./historicoRoutes')

const router = Router();

// Monta as rotas com seus respectivos prefixos
router.use('/usuarios', userRoutes);
router.use('/lavanderias', lavanderiaRoutes);
router.use('/maquinas', maquinaRoutes);
router.use('/suporte', supportRoutes);
router.use('/historico-lavagens', historicoRoutes)

module.exports = router;