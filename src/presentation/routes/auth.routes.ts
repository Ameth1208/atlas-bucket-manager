import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  router.post("/login", authController.login);
  router.post("/logout", authController.logout);

  return router;
};
