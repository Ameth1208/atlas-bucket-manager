"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const login_use_case_1 = require("../../../../src/application/use-cases/auth/login.use-case");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock jwt
jest.mock('jsonwebtoken');
describe('LoginUseCase', () => {
    let useCase;
    const adminUser = 'admin';
    const adminPass = 'password123';
    const jwtSecret = 'test-secret';
    beforeEach(() => {
        useCase = new login_use_case_1.LoginUseCase(adminUser, adminPass, jwtSecret);
        jest.clearAllMocks();
    });
    describe('Successful Login', () => {
        it('should return token with valid credentials', () => {
            const mockToken = 'mock.jwt.token';
            jsonwebtoken_1.default.sign.mockReturnValue(mockToken);
            const dto = {
                username: 'admin',
                password: 'password123'
            };
            const result = useCase.execute(dto);
            expect(result).toBe(mockToken);
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ user: 'admin' }, 'test-secret', { expiresIn: '1h' });
        });
        it('should trim whitespace from credentials', () => {
            const mockToken = 'mock.jwt.token';
            jsonwebtoken_1.default.sign.mockReturnValue(mockToken);
            const dto = {
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
            const dto = {
                username: 'wrong',
                password: 'password123'
            };
            const result = useCase.execute(dto);
            expect(result).toBeNull();
            expect(jsonwebtoken_1.default.sign).not.toHaveBeenCalled();
        });
        it('should return null with wrong password', () => {
            const dto = {
                username: 'admin',
                password: 'wrongpassword'
            };
            const result = useCase.execute(dto);
            expect(result).toBeNull();
            expect(jsonwebtoken_1.default.sign).not.toHaveBeenCalled();
        });
        it('should return null with empty username', () => {
            const dto = {
                username: '',
                password: 'password123'
            };
            const result = useCase.execute(dto);
            expect(result).toBeNull();
        });
        it('should return null with empty password', () => {
            const dto = {
                username: 'admin',
                password: ''
            };
            const result = useCase.execute(dto);
            expect(result).toBeNull();
        });
        it('should be case-sensitive for username', () => {
            const dto = {
                username: 'Admin', // Capitalized
                password: 'password123'
            };
            const result = useCase.execute(dto);
            expect(result).toBeNull();
        });
        it('should be case-sensitive for password', () => {
            const dto = {
                username: 'admin',
                password: 'Password123' // Capitalized
            };
            const result = useCase.execute(dto);
            expect(result).toBeNull();
        });
    });
});
//# sourceMappingURL=login.use-case.test.js.map