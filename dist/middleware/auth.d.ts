import { Request, Response, NextFunction } from 'express';
interface UserPayload {
    user: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.d.ts.map