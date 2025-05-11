import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAdmin } from './create-admin.guard';

describe('CreateAdmin Guard', () => {
  let guard: CreateAdmin;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = { verify: jest.fn() } as any;
    guard = new CreateAdmin(jwtService);
  });

  it('should allow non-admin creation', () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ body: { role: 'user' } }) }),
    };
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw if no token for admin creation', () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ body: { role: 'admin' }, headers: {}, cookies: {} }) }),
    };
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw if token is not admin', () => {
    (jwtService.verify as jest.Mock).mockReturnValue({ role: 'user' });
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({
        body: { role: 'admin' },
        headers: { authorization: 'Bearer token' },
        cookies: {},
      }) }),
    };
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow if token is admin', () => {
    (jwtService.verify as jest.Mock).mockReturnValue({ role: 'admin' });
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({
        body: { role: 'admin' },
        headers: { authorization: 'Bearer token' },
        cookies: {},
      }) }),
    };
    expect(guard.canActivate(context)).toBe(true);
  });
});
