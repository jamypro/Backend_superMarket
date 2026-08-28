const express = require('express');

const productoController = require('../controllers/producto.controller');

const router = express.Router();

router.get('/', productoController.list);
router.get('/:id', productoController.getById);
router.post('/', productoController.create);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.remove);

module.exports = router;
