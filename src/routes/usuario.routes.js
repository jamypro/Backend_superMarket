const express = require('express');

const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', usuarioController.list);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.patch('/:id/contrasena', usuarioController.changePassword);
router.delete('/:id', usuarioController.remove);

module.exports = router;
