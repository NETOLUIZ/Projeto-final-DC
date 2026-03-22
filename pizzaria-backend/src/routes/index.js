const express = require('express');

// Importação das "sub-rotas" (pastas lógicas do sistema)
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const tableRoutes = require('./tableRoutes');
const cashRoutes = require('./cashRoutes');
const driverRoutes = require('./driverRoutes');
const orderRoutes = require('./orderRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router(); // Cria um novo roteador no Express

// "Acopla" as sub-rotas aos seus caminhos base.
// Por exemplo: Quando chamarem '/api/users', as funções dentro de userRoutes vão processar.
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/tables', tableRoutes);
router.use('/cash', cashRoutes);
router.use('/drivers', driverRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
// router.use('/cash', cashRoutes);
// router.use('/drivers', driverRoutes);
// router.use('/orders', orderRoutes);
// router.use('/dashboard', dashboardRoutes);

module.exports = router;
