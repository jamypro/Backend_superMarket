import express from "express";

import * as productoController from "../controllers/producto.controller.js";

const router = express.Router();

router.get('/', productoController.list);
router.get('/:id', productoController.getById);
router.post('/', productoController.create);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.remove);

export default router;
