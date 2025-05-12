import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findUserByEmail: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'a',
        password: 'hashed',
        role: 'admin',
      };
      const usersService = service['usersService'] as any;
      usersService.findUserByEmail = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      const result = await service.validateUser('a', 'b');
      expect(result).toEqual({
        id: 1,
        username: 'test',
        email: 'a',
        role: 'admin',
      });
    });
    it('should return null if user not found', async () => {
      const usersService = service['usersService'] as any;
      usersService.findUserByEmail = jest.fn().mockResolvedValue(null);
      const result = await service.validateUser('a', 'b');
      expect(result).toBeNull();
    });
    it('should return null if password does not match', async () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'a',
        password: 'hashed',
        role: 'admin',
      };
      const usersService = service['usersService'] as any;
      usersService.findUserByEmail = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      const result = await service.validateUser('a', 'b');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const jwtService = service['jwtService'] as any;
      jwtService.sign = jest.fn().mockReturnValue('signed_token');
      const user = { id: 1, username: 'test', role: 'admin' };
      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'signed_token' });
    });
  });
});
