import express from "express";

import * as productoController from "../controllers/producto.controller.js";
import { verificarToken, autorizarRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verificarToken);

router.get('/', autorizarRoles(1, 2, 3, 4, 5), productoController.list);
router.get('/:id', autorizarRoles(1, 2, 3, 4, 5), productoController.getById);
router.post('/', autorizarRoles(1, 2), productoController.create);
router.put('/:id', autorizarRoles(1, 2), productoController.update);
router.delete('/:id', autorizarRoles(1), productoController.remove);

export default router;