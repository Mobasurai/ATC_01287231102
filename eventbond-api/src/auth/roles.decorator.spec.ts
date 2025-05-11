import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles Decorator', () => {
  it('should set metadata with roles', () => {
    const setMetadata = jest.fn();
    jest.mock('@nestjs/common', () => ({ SetMetadata: setMetadata }));
    Roles('admin', 'user');
    expect(ROLES_KEY).toBe('roles');
  });
});
