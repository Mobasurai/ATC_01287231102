import { ForbiddenException } from '@nestjs/common';
import { OwnerOrAdmin } from './owner-or-admin.guard';

describe('OwnerOrAdmin Guard', () => {
  let guard: OwnerOrAdmin;

  beforeEach(() => {
    guard = new OwnerOrAdmin();
  });

  it('should throw if no user', () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ params: {} }) }),
    };
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow if user is admin', () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'admin' }, params: { id: '2' } }) }),
    };
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow if user is owner', () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'user', userId: 5 }, params: { id: '5' } }) }),
    };
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw if not owner or admin', () => {
    const context: any = {
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'user', userId: 1 }, params: { id: '2' } }) }),
    };
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
