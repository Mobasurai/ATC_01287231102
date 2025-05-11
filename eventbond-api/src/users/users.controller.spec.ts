import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './users.entity';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;
  let service: Partial<Record<keyof UsersService, jest.Mock>>;

  const mockUser: User = {
    id: 1,
    username: 'John Doe',
    password: 'password1234',
    email: 'johndoe@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    service = {
      findAllUsers: jest.fn().mockResolvedValue([mockUser]),
      findUserById: jest.fn().mockResolvedValue(mockUser),
      createUser: jest
        .fn()
        .mockImplementation((dto) => Promise.resolve({ ...mockUser, ...dto })),
      updateUser: jest
        .fn()
        .mockImplementation((id, dto) =>
          Promise.resolve({ ...mockUser, ...dto }),
        ),
      deleteUser: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('returns an array of users', async () => {
      const result = await controller.getUsers();
      expect(service.findAllUsers).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getUser', () => {
    it('returns a single user by id', async () => {
      const result = await controller.getUser(1);
      expect(service.findUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('creates and returns a new user', async () => {
      const dto: CreateUserDto = {
        username: 'Mohamed',
        email: 'mohamed@example.com',
        role: 'admin',
        password: 'password1234',
      };
      const result = await controller.createUser(dto);
      expect(service.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ ...mockUser, ...dto });
    });
  });

  describe('updateUser', () => {
    it('updates and returns the user', async () => {
      const updateData: Partial<User> = { username: 'John Doe Updated' };
      const result = await controller.updateUser(1, updateData as User);
      expect(service.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({ ...mockUser, ...updateData });
    });
  });

  describe('deleteUser', () => {
    it('deletes the user', async () => {
      const result = await controller.deleteUser(1);
      expect(service.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
