import express from "express";

import * as categoriaController from "../controllers/categoria.controller.js";

const router = express.Router();

router.get('/', categoriaController.list);
router.get('/:id', categoriaController.getById);
router.post('/', categoriaController.create);
router.put('/:id', categoriaController.update);
router.delete('/:id', categoriaController.remove);

export default router;
