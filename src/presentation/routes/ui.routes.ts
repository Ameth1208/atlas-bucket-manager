import { Router, Request, Response } from "express";
import path from "path";

export const createUiRoutes = (authMiddleware: any) => {
  const router = Router();
  
  // Determine HTML directory based on environment
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const htmlDir = isDevelopment 
    ? path.join(__dirname, "../../../public")           // Dev: public/
    : path.join(__dirname, "../../../dist-frontend");   // Prod: dist-frontend/

  router.get("/", (req: Request, res: Response) => res.redirect("/login"));

  router.get("/login", (req: Request, res: Response) => {
    res.sendFile(path.join(htmlDir, "login.html"));
  });

  router.get("/manager", authMiddleware, (req: Request, res: Response) => {
    res.sendFile(path.join(htmlDir, "manager.html"));
  });

  // SPA routing - serve manager.html for all /manager/* routes
  router.get(/^\/manager\/.*/, authMiddleware, (req: Request, res: Response) => {
    res.sendFile(path.join(htmlDir, "manager.html"));
  });

  return router;
};
