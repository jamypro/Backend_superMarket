import express from "express";

import * as inventarioController from "../controllers/inventario.controller.js";
import { verificarToken, autorizarRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", inventarioController.list);
router.get("/movimientos", inventarioController.listMovimientos);
router.get("/:productoId", inventarioController.getByProducto);
router.post(
  "/entrada",
  verificarToken,
  autorizarRoles(1, 2),
  inventarioController.registrarEntrada,
);

export default router;
