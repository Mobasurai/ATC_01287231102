import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

const mockEventsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;
  let mockEventsServiceWithPagination: any;

  beforeEach(async () => {
    mockEventsServiceWithPagination = {
      ...mockEventsService,
      findAllPaginated: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsServiceWithPagination },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getEvents with pagination', async () => {
    const paginatedResult = { data: [{ id: 1 }], total: 1, page: 1, limit: 10 };
    mockEventsServiceWithPagination.findAllPaginated.mockResolvedValue(
      paginatedResult,
    );
    const result = await controller.getEvents(1, 10);
    expect(
      mockEventsServiceWithPagination.findAllPaginated,
    ).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(paginatedResult);
  });

  it('should call getEvent', async () => {
    await controller.getEvent(1);
    expect(mockEventsServiceWithPagination.findOne).toHaveBeenCalledWith(1);
  });

  it('should call createEvent', async () => {
    const req = { user: { id: 1, role: 'admin' } };
    const dto = {
      title: 'Test',
      description: 'desc',
      startDate: '2025-05-11T10:00:00.000Z',
      endDate: '2025-05-11T12:00:00.000Z',
      venue: 'venue',
      price: 10,
      categoryId: 1,
    };
    await controller.createEvent(dto, req);
    expect(mockEventsServiceWithPagination.create).toHaveBeenCalledWith(
      dto,
      req.user,
    );
  });

  it('should call updateEvent', async () => {
    const req = { user: { id: 1, role: 'admin' } };
    const dto = {
      title: 'Updated',
      description: 'desc',
      startDate: '2025-05-11T10:00:00.000Z',
      endDate: '2025-05-11T12:00:00.000Z',
      venue: 'venue',
      price: 10,
    };
    await controller.updateEvent(1, dto, req);
    expect(mockEventsServiceWithPagination.update).toHaveBeenCalledWith(
      1,
      dto,
      req.user,
    );
  });

  it('should call deleteEvent', async () => {
    const req = { user: { id: 1, role: 'admin' } };
    await controller.deleteEvent(1, req);
    expect(mockEventsServiceWithPagination.remove).toHaveBeenCalledWith(
      1,
      req.user,
    );
  });

  it('should call searchEvents with searchText', async () => {
    const paginatedResult = {
      data: [{ id: 1, title: 'Music Fest' }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockEventsServiceWithPagination.searchEvents = jest
      .fn()
      .mockResolvedValue(paginatedResult);
    const result = await controller.searchEvents('Music', undefined, 1, 10);
    expect(mockEventsServiceWithPagination.searchEvents).toHaveBeenCalledWith(
      'Music',
      undefined,
      1,
      10,
    );
    expect(result).toEqual(paginatedResult);
  });

  it('should call searchEvents with categoryId', async () => {
    const paginatedResult = {
      data: [{ id: 2, title: 'Tech Expo', categoryId: 5 }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockEventsServiceWithPagination.searchEvents = jest
      .fn()
      .mockResolvedValue(paginatedResult);
    const result = await controller.searchEvents(undefined, 5, 1, 10);
    expect(mockEventsServiceWithPagination.searchEvents).toHaveBeenCalledWith(
      undefined,
      5,
      1,
      10,
    );
    expect(result).toEqual(paginatedResult);
  });

  it('should call searchEvents with searchText and categoryId', async () => {
    const paginatedResult = {
      data: [{ id: 3, title: 'Music Tech', categoryId: 2 }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockEventsServiceWithPagination.searchEvents = jest
      .fn()
      .mockResolvedValue(paginatedResult);
    const result = await controller.searchEvents('Music', 2, 1, 10);
    expect(mockEventsServiceWithPagination.searchEvents).toHaveBeenCalledWith(
      'Music',
      2,
      1,
      10,
    );
    expect(result).toEqual(paginatedResult);
  });
});
