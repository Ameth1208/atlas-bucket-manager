import { Router, Request, Response } from "express";
import path from "path";

export const createUiRoutes = (authMiddleware: any) => {
  const router = Router();

  router.get("/", (req: Request, res: Response) => res.redirect("/login"));

  router.get("/login", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../../public/login.html"));
  });

  router.get("/manager", authMiddleware, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../../public/manager.html"));
  });

  router.get(/^\/manager\/.*/, authMiddleware, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../../public/manager.html"));
  });

  return router;
};
