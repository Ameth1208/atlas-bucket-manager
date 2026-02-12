import { Router, Request, Response } from "express";
import path from "path";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", (req: Request, res: Response) => res.redirect("/login"));

router.get("/login", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/login.html"));
});

// Main manager route and sub-routes for SPA
router.get("/manager", requireAuth, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/manager.html"));
});

router.get(/^\/manager\/.*/, requireAuth, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/manager.html"));
});

export default router;
