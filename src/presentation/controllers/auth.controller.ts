import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { SetupUseCase } from '../../application/use-cases/auth/setup.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private setupUseCase: SetupUseCase,
    private userRepository: IUserRepository
  ) {}

  status = (_req: Request, res: Response) => {
    res.json({ isSetup: this.setupUseCase.isComplete() });
  };

  me = (req: Request, res: Response) => {
    if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const user = this.userRepository.findById(req.user.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  };

  setup = (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'name, email and password required' });
        return;
      }
      const result = this.setupUseCase.execute({ name, email, password });
      res.cookie('auth_token', result.token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ success: true, user: result.user });
    } catch (err: any) {
      if (err.message === 'ALREADY_SETUP') { res.status(409).json({ error: 'Already set up' }); return; }
      res.status(500).json({ error: err.message });
    }
  };

  login = (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) { res.status(400).json({ error: 'email and password required' }); return; }
      const result = this.loginUseCase.execute({ email, password });
      if (!result) { res.status(401).json({ error: 'Invalid credentials' }); return; }
      res.cookie('auth_token', result.token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ success: true, user: result.user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  logout = (_req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  };
}
