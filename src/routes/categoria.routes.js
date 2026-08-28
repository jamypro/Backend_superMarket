const express = require('express');

const categoriaController = require('../controllers/categoria.controller');

const router = express.Router();

router.get('/', categoriaController.list);
router.get('/:id', categoriaController.getById);
router.post('/', categoriaController.create);
router.put('/:id', categoriaController.update);
router.delete('/:id', categoriaController.remove);

module.exports = router;
