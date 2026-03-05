import jwt from 'jsonwebtoken';
import { LoginDto } from '../../dtos/login.dto';

export class LoginUseCase {
  constructor(
    private adminUser: string,
    private adminPass: string,
    private jwtSecret: string
  ) {}

  execute(dto: LoginDto): string | null {
    const { username, password } = dto;

    if (username === this.adminUser && password === this.adminPass) {
      const token = jwt.sign({ user: username }, this.jwtSecret, {
        expiresIn: '1h',
      });
      return token;
    }

    return null;
  }
}
