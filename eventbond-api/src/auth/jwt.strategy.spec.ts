import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const OLD_ENV = process.env;
  beforeAll(() => {
    process.env = { ...OLD_ENV, JWT_SECRET: 'test_secret' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });
  it('should validate and return user object', async () => {
    const strategy = new JwtStrategy();
    const payload = { sub: 1, username: 'test', role: 'admin' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ userId: 1, username: 'test', role: 'admin' });
  });
});
