import { Request, Response } from 'express';
import { CreateApiKeyUseCase } from '../../application/use-cases/api-keys/create-api-key.use-case';
import { ListApiKeysUseCase } from '../../application/use-cases/api-keys/list-api-keys.use-case';
import { RevokeApiKeyUseCase } from '../../application/use-cases/api-keys/revoke-api-key.use-case';

export class ApiKeyController {
  constructor(
    private createApiKeyUseCase: CreateApiKeyUseCase,
    private listApiKeysUseCase: ListApiKeysUseCase,
    private revokeApiKeyUseCase: RevokeApiKeyUseCase
  ) {}

  list = (req: Request, res: Response) => {
    const keys = this.listApiKeysUseCase.execute(req.user!.userId, req.user!.role);
    res.json(keys);
  };

  create = (req: Request, res: Response) => {
    try {
      const { name, scopes, bucketFilter } = req.body;
      if (!name || !scopes) { res.status(400).json({ error: 'name and scopes required' }); return; }
      const key = this.createApiKeyUseCase.execute({ name, scopes, userId: req.user!.userId, bucketFilter });
      res.status(201).json(key);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  revoke = (req: Request, res: Response) => {
    try {
      this.revokeApiKeyUseCase.execute(req.params.id, req.user!.userId, req.user!.role);
      res.json({ success: true });
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') { res.status(404).json({ error: 'API key not found' }); return; }
      if (err.message === 'FORBIDDEN') { res.status(403).json({ error: 'Forbidden' }); return; }
      if (err.message === 'ALREADY_REVOKED') { res.status(409).json({ error: 'Already revoked' }); return; }
      res.status(500).json({ error: err.message });
    }
  };
}
