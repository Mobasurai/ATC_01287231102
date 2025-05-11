import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const createMockUser = (overrides?: Partial<User>): User => {
  const defaultUser: User = {
    id: 1,
    username: 'John Doe',
    email: 'johndoe@email.com',
    password: 'password1234',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { ...defaultUser, ...overrides } as User;
};

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create:    jest.fn().mockReturnValue({ id: 1 } as User),
    save:      jest.fn().mockResolvedValue(undefined as any),
    update:    jest.fn().mockReturnValue({ id: 1 } as User),
    findOneBy: jest.fn().mockResolvedValue(createMockUser()),
    find:      jest.fn().mockResolvedValue([createMockUser()]),
    delete:    jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = createMockUser();
    (mockUserRepository.save as jest.Mock).mockResolvedValue(user);

    const created = await service.createUser(user);
    expect(mockUserRepository.create).toHaveBeenCalledWith(user);
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(created).toEqual(user);
  });

  it('should update a user', async () => {
    const updatedData = createMockUser({ password: 'newpassword1234' });
    (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(updatedData);

    const updated = await service.updateUser(1, updatedData);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(updated).toEqual(updatedData);
  });

  it('should find all users', async () => {
    const users = await service.findAllUsers();
    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(users).toBeInstanceOf(Array);
  });

  it('should find a user by id', async () => {
    const user = await service.findUserById(1);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(user.id).toEqual(1);
  });

  it('should return null if user not found', async () => {
    (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(null);
    const result = await service.findUserById(999);
    expect(result).toBeNull();
  });

  it('should delete a user', async () => {
    (mockUserRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
    await service.deleteUser(1);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
  });
});