import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './categories.entity';
import { User } from '../users/users.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return categories', async () => {
    const result = [{ id: 1, name: 'Test', createdBy: {} as User }];
    mockCategoryRepository.find.mockResolvedValue(result);
    expect(await service.findAll()).toBe(result);
    expect(mockCategoryRepository.find).toHaveBeenCalledWith({
      relations: ['createdBy'],
    });
  });

  it('findOne should return a category', async () => {
    const result = { id: 1, name: 'Test', createdBy: {} as User };
    mockCategoryRepository.findOne.mockResolvedValue(result);
    expect(await service.findOne(1)).toBe(result);
    expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['createdBy'],
    });
  });

  it('create should create and save a category', async () => {
    const name = 'Test';
    const user = { id: 1 } as User;
    const category = {
      name,
      createdBy: user,
    } as Category;
    mockCategoryRepository.create.mockReturnValue(category);
    mockCategoryRepository.save.mockResolvedValue(category);
    expect(await service.create(name, user)).toBe(category);
    expect(mockCategoryRepository.create).toHaveBeenCalledWith({
      name,
      createdBy: user,
    });
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
  });

  it('remove should call delete', async () => {
    mockCategoryRepository.delete.mockResolvedValue(undefined);
    await service.remove(1);
    expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
  });
});
