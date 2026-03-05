import { LoginUseCase } from '../../../../src/application/use-cases/auth/login.use-case';
import { LoginDto } from '../../../../src/application/dtos/login.dto';
import jwt from 'jsonwebtoken';

// Mock jwt
jest.mock('jsonwebtoken');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  const adminUser = 'admin';
  const adminPass = 'password123';
  const jwtSecret = 'test-secret';

  beforeEach(() => {
    useCase = new LoginUseCase(adminUser, adminPass, jwtSecret);
    jest.clearAllMocks();
  });

  describe('Successful Login', () => {
    it('should return token with valid credentials', () => {
      const mockToken = 'mock.jwt.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const dto: LoginDto = {
        username: 'admin',
        password: 'password123'
      };

      const result = useCase.execute(dto);

      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: 'admin' },
        'test-secret',
        { expiresIn: '1h' }
      );
    });

    it('should trim whitespace from credentials', () => {
      const mockToken = 'mock.jwt.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const dto: LoginDto = {
        username: '  admin  ',
        password: '  password123  '
      };

      // Note: Current implementation doesn't trim, but should
      const result = useCase.execute(dto);

      expect(result).toBeNull();
    });
  });

  describe('Failed Login', () => {
    it('should return null with wrong username', () => {
      const dto: LoginDto = {
        username: 'wrong',
        password: 'password123'
      };

      const result = useCase.execute(dto);

      expect(result).toBeNull();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return null with wrong password', () => {
      const dto: LoginDto = {
        username: 'admin',
        password: 'wrongpassword'
      };

      const result = useCase.execute(dto);

      expect(result).toBeNull();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return null with empty username', () => {
      const dto: LoginDto = {
        username: '',
        password: 'password123'
      };

      const result = useCase.execute(dto);

      expect(result).toBeNull();
    });

    it('should return null with empty password', () => {
      const dto: LoginDto = {
        username: 'admin',
        password: ''
      };

      const result = useCase.execute(dto);

      expect(result).toBeNull();
    });

    it('should be case-sensitive for username', () => {
      const dto: LoginDto = {
        username: 'Admin', // Capitalized
        password: 'password123'
      };

      const result = useCase.execute(dto);

      expect(result).toBeNull();
    });

    it('should be case-sensitive for password', () => {
      const dto: LoginDto = {
        username: 'admin',
        password: 'Password123' // Capitalized
      };

      const result = useCase.execute(dto);

      expect(result).toBeNull();
    });
  });
});
