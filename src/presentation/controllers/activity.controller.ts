import { Request, Response } from 'express';
import { ListActivityUseCase } from '../../application/use-cases/activity/list-activity.use-case';

export class ActivityController {
  constructor(private listActivityUseCase: ListActivityUseCase) {}

  list = (req: Request, res: Response) => {
    const limit = parseInt(String(req.query.limit || '50'));
    const offset = parseInt(String(req.query.offset || '0'));
    res.json(this.listActivityUseCase.execute(limit, offset));
  };
}
