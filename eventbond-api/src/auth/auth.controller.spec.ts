import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return success message and set cookie on valid login', async () => {
      const mockRes: any = { cookie: jest.fn() };
      const mockUser = { id: 1, username: 'test', role: 'admin' };
      const mockToken = { access_token: 'token' };
      const authService = controller['authService'] as any;
      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue(mockToken);
      const result = await controller.login({ email: 'a', password: 'b' }, mockRes);
      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', 'token', expect.any(Object));
      expect(result).toEqual({ message: 'Login successful' });
    });

    it('should throw UnauthorizedException on invalid login', async () => {
      const mockRes: any = { cookie: jest.fn() };
      const authService = controller['authService'] as any;
      authService.validateUser.mockResolvedValue(null);
      await expect(controller.login({ email: 'a', password: 'b' }, mockRes)).rejects.toThrow('Invalid credentials');
    });
  });
});
