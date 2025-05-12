import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { User } from '../users/users.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCategories should return all categories', async () => {
    const result = [{ id: 1, name: 'Test' }];
    mockCategoriesService.findAll.mockResolvedValue(result);
    expect(await controller.getCategories()).toBe(result);
    expect(mockCategoriesService.findAll).toHaveBeenCalled();
  });

  it('getCategory should return a category', async () => {
    const result = { id: 1, name: 'Test' };
    mockCategoriesService.findOne.mockResolvedValue(result);
    expect(await controller.getCategory(1)).toBe(result);
    expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
  });

  it('createCategory should create a category', async () => {
    const name = 'Test';
    const user = { id: 1 } as User;
    const req = { user };
    const result = { id: 1, name, createdBy: user };
    mockCategoriesService.create.mockResolvedValue(result);
    expect(await controller.createCategory(name, req)).toBe(result);
    expect(mockCategoriesService.create).toHaveBeenCalledWith(name, user);
  });

  it('remove should delete a category', async () => {
    mockCategoriesService.remove.mockResolvedValue(undefined);
    expect(await controller.remove(1)).toBeUndefined();
    expect(mockCategoriesService.remove).toHaveBeenCalledWith(1);
  });
});
