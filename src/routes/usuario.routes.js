import express from "express";

import * as usuarioController from "../controllers/usuario.controller.js";
import { verificarToken, autorizarRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verificarToken);

router.get("/", usuarioController.list);
router.get("/:id", usuarioController.getById);
router.post("/", usuarioController.create);
router.put("/:id", usuarioController.update);
router.patch("/:id/contrasena", usuarioController.changePassword);
router.delete("/:id", autorizarRoles(1), usuarioController.remove);

export default router;
