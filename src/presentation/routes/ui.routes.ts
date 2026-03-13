import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

// Read app version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../../package.json"), "utf-8")
);
const APP_VERSION = packageJson.version;

export const createUiRoutes = (authMiddleware: any) => {
  const router = Router();
  
  // Determine HTML directory based on environment
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const htmlDir = isDevelopment 
    ? path.join(__dirname, "../../../public")           // Dev: public/
    : path.join(__dirname, "../../../dist-frontend");   // Prod: dist-frontend/

  router.get("/", (req: Request, res: Response) => res.redirect("/login"));

  router.get("/login", (req: Request, res: Response) => {
    const html = fs.readFileSync(path.join(htmlDir, "login.html"), "utf-8")
      .replace(/\{\{APP_VERSION\}\}/g, APP_VERSION);
    res.send(html);
  });

  router.get("/manager", authMiddleware, (req: Request, res: Response) => {
    const html = fs.readFileSync(path.join(htmlDir, "manager.html"), "utf-8")
      .replace(/\{\{APP_VERSION\}\}/g, APP_VERSION);
    res.send(html);
  });

  // SPA routing - serve manager.html for all /manager/* routes
  router.get(/^\/manager\/.*/, authMiddleware, (req: Request, res: Response) => {
    const html = fs.readFileSync(path.join(htmlDir, "manager.html"), "utf-8")
      .replace(/\{\{APP_VERSION\}\}/g, APP_VERSION);
    res.send(html);
  });

  return router;
};
