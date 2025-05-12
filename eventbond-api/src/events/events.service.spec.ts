import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';

const mockEventRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
  findAndCount: jest.fn(),
});

describe('EventsService', () => {
  let service: EventsService;
  let repo: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useFactory: mockEventRepository },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repo = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ForbiddenException if non-admin tries to create', async () => {
    await expect(
      service.create(
        {
          title: '',
          description: '',
          startDate: '2025-05-11T10:00:00.000Z',
          endDate: '2025-05-11T12:00:00.000Z',
          venue: '',
          price: 0,
          categoryId: 1,
        },
        {
          id: 1,
          username: 'user',
          email: 'user@example.com',
          password: 'password',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ),
    ).rejects.toThrow('Action is forbidden');
  });

  it('should allow admin to create', async () => {
    jest.spyOn(repo, 'create').mockReturnValue({ id: 1 } as any);
    jest.spyOn(repo, 'save').mockResolvedValue({ id: 1 } as any);
    const result = await service.create(
      {
        title: 'Test',
        description: '',
        startDate: '2025-05-11T10:00:00.000Z',
        endDate: '2025-05-11T12:00:00.000Z',
        venue: '',
        price: 0,
        categoryId: 1,
      },
      {
        id: 1,
        role: 'admin',
      } as any,
    );
    expect(result).toEqual({ id: 1 });
  });

  it('should create an event', async () => {
    const event = {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      venue: '',
      price: 0,
      categoryId: 1,
    };
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(repo, 'create').mockReturnValue(event as any);
    jest.spyOn(repo, 'save').mockResolvedValue(event as any);
    expect(await service.create(event, user)).toBe(event);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(event);
  });

  it('should return all events', async () => {
    const events = [{ id: 1 }, { id: 2 }];
    jest.spyOn(repo, 'find').mockResolvedValue(events as any);
    const result = await service.findAll();
    expect(result).toEqual(events);
  });

  it('should return one event by id', async () => {
    const event = { id: 1 };
    jest.spyOn(repo, 'findOne').mockResolvedValue(event as any);
    const result = await service.findOne(1);
    expect(result).toEqual(event);
  });

  it('should throw NotFoundException if event not found', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);
    await expect(service.findOne(999)).rejects.toThrow('Event not found');
  });

  it('should update event if admin', async () => {
    const event = { id: 1, title: 'Old' };
    jest.spyOn(service, 'findOne').mockResolvedValue(event as any);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue({ ...event, title: 'New' } as any);
    const result = await service.update(
      1,
      {
        title: 'New',
        description: '',
        startDate: '2025-05-11T10:00:00.000Z',
        endDate: '2025-05-11T12:00:00.000Z',
        venue: '',
        price: 0,
      },
      {
        id: 1,
        role: 'admin',
      } as any,
    );
    expect(result.title).toBe('New');
  });

  it('should update an event', async () => {
    const event = {
      title: 'Test',
      description: '',
      startDate: '',
      endDate: '',
      venue: '',
      price: 0,
    };
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const foundEvent = { id: 1, ...event };
    jest.spyOn(service, 'findOne').mockResolvedValue(foundEvent as any);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue({ ...foundEvent, ...event } as any);
    const result = await service.update(1, event, user);
    expect(result).toEqual({ ...foundEvent, ...event });
    expect(repo.save).toHaveBeenCalledWith({ ...foundEvent, ...event });
  });

  it('should throw ForbiddenException if non-admin tries to update', async () => {
    const event = { id: 1, title: 'Old' };
    jest.spyOn(service, 'findOne').mockResolvedValue(event as any);
    jest
      .spyOn(repo, 'save')
      .mockResolvedValue({ ...event, title: 'New' } as any);
    await expect(
      service.update(
        1,
        {
          title: 'New',
          description: '',
          startDate: '2025-05-11T10:00:00.000Z',
          endDate: '2025-05-11T12:00:00.000Z',
          venue: '',
          price: 0,
        },
        { id: 2, role: 'user' } as any,
      ),
    ).rejects.toThrow('Action is forbidden');
  });

  it('should remove event if admin', async () => {
    const event = { id: 1 };
    jest.spyOn(service, 'findOne').mockResolvedValue(event as any);
    const removeSpy = jest.spyOn(repo, 'remove').mockResolvedValue(undefined);
    await service.remove(1, { id: 1, role: 'admin' } as any);
    expect(removeSpy).toHaveBeenCalledWith(event);
  });

  it('should throw ForbiddenException if non-admin tries to remove', async () => {
    const event = { id: 1 };
    jest.spyOn(service, 'findOne').mockResolvedValue(event as any);
    await expect(
      service.remove(1, { id: 2, role: 'user' } as any),
    ).rejects.toThrow('Action is forbidden');
  });

  it('should return paginated events', async () => {
    const paginatedResult = { data: [{ id: 1 }], total: 1, page: 1, limit: 10 };
    jest.spyOn(repo, 'findAndCount').mockResolvedValue([[{ id: 1 }], 1] as any);
    const result = await service.findAllPaginated(1, 10);
    expect(result).toEqual(paginatedResult);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: { startDate: 'DESC' },
    });
  });

  it('should search events by title', async () => {
    const paginatedResult = {
      data: [{ id: 1, title: 'Music Fest' }],
      total: 1,
      page: 1,
      limit: 10,
    };
    jest
      .spyOn(repo, 'findAndCount')
      .mockResolvedValue([[{ id: 1, title: 'Music Fest' }], 1] as any);
    const result = await service.searchEvents('Music', undefined, 1, 10);
    expect(result).toEqual(paginatedResult);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: { title: expect.any(Object) },
      skip: 0,
      take: 10,
      order: { startDate: 'DESC' },
    });
  });

  it('should filter events by category', async () => {
    const paginatedResult = {
      data: [{ id: 2, title: 'Tech Expo', categoryId: 5 }],
      total: 1,
      page: 1,
      limit: 10,
    };
    jest
      .spyOn(repo, 'findAndCount')
      .mockResolvedValue([
        [{ id: 2, title: 'Tech Expo', categoryId: 5 }],
        1,
      ] as any);
    const result = await service.searchEvents(undefined, 5, 1, 10);
    expect(result).toEqual(paginatedResult);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: { categoryId: 5 },
      skip: 0,
      take: 10,
      order: { startDate: 'DESC' },
    });
  });

  it('should search and filter events by title and category', async () => {
    const paginatedResult = {
      data: [{ id: 3, title: 'Music Tech', categoryId: 2 }],
      total: 1,
      page: 1,
      limit: 10,
    };
    jest
      .spyOn(repo, 'findAndCount')
      .mockResolvedValue([
        [{ id: 3, title: 'Music Tech', categoryId: 2 }],
        1,
      ] as any);
    const result = await service.searchEvents('Music', 2, 1, 10);
    expect(result).toEqual(paginatedResult);
    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: { title: expect.any(Object), categoryId: 2 },
      skip: 0,
      take: 10,
      order: { startDate: 'DESC' },
    });
  });
});
