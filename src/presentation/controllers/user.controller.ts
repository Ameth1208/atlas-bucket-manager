import { Request, Response } from 'express';
import { ListUsersUseCase } from '../../application/use-cases/users/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.use-case';

export class UserController {
  constructor(
    private listUsersUseCase: ListUsersUseCase,
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase
  ) {}

  list = (_req: Request, res: Response) => {
    res.json(this.listUsersUseCase.execute());
  };

  create = (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) { res.status(400).json({ error: 'name, email and password required' }); return; }
      const user = this.createUserUseCase.execute({ name, email, password, role });
      res.status(201).json(user);
    } catch (err: any) {
      if (err.message === 'EMAIL_TAKEN') { res.status(409).json({ error: 'Email already in use' }); return; }
      res.status(500).json({ error: err.message });
    }
  };

  update = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = this.updateUserUseCase.execute(id, req.body);
      res.json(user);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'User not found' }); return; }
      if (err.message === 'EMAIL_TAKEN') { res.status(409).json({ error: 'Email already in use' }); return; }
      res.status(500).json({ error: err.message });
    }
  };

  delete = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      this.deleteUserUseCase.execute(id, req.user!.userId);
      res.json({ success: true });
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'User not found' }); return; }
      if (err.message === 'CANNOT_DELETE_SELF') { res.status(400).json({ error: 'Cannot delete your own account' }); return; }
      res.status(500).json({ error: err.message });
    }
  };
}
