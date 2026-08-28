const express = require('express');

const inventarioController = require('../controllers/inventario.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', inventarioController.list);
router.get('/movimientos', inventarioController.listMovimientos);
router.get('/:productoId', inventarioController.getByProducto);
router.post('/entrada', authMiddleware, inventarioController.registrarEntrada);

module.exports = router;
