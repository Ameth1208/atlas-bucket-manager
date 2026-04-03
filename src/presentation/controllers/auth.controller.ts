import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  login = (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const token = this.loginUseCase.execute({ username, password });
      if (token) {
        res.cookie("auth_token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  logout = (req: Request, res: Response) => {
    res.clearCookie("auth_token");
    res.json({ success: true });
  };
}
