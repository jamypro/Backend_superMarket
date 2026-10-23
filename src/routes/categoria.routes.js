import express from "express";

import * as categoriaController from "../controllers/categoria.controller.js";
import { verificarToken, autorizarRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verificarToken);

router.get('/', autorizarRoles(1, 2, 3, 4, 5), categoriaController.list);
router.get('/:id', autorizarRoles(1, 2, 3, 4, 5), categoriaController.getById);
router.post('/', autorizarRoles(1, 2), categoriaController.create);
router.put('/:id', autorizarRoles(1, 2), categoriaController.update);
router.delete('/:id', autorizarRoles(1), categoriaController.remove);

export default router;