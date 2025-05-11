import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('should allow if no required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'user' } }) }),
      getHandler: () => {},
      getClass: () => {},
    };
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow if user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'admin' } }) }),
      getHandler: () => {},
      getClass: () => {},
    };
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny if user does not have required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'user' } }) }),
      getHandler: () => {},
      getClass: () => {},
    };
    expect(guard.canActivate(context)).toBe(false);
  });
});
