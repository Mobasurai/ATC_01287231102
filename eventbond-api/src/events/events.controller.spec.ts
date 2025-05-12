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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getEvents', async () => {
    await controller.getEvents();
    expect(mockEventsService.findAll).toHaveBeenCalled();
  });

  it('should call getEvent', async () => {
    await controller.getEvent('1');
    expect(mockEventsService.findOne).toHaveBeenCalledWith(1);
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
    expect(mockEventsService.create).toHaveBeenCalledWith(dto, req.user);
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
    await controller.updateEvent('1', dto, req);
    expect(mockEventsService.update).toHaveBeenCalledWith(1, dto, req.user);
  });

  it('should call deleteEvent', async () => {
    const req = { user: { id: 1, role: 'admin' } };
    await controller.deleteEvent('1', req);
    expect(mockEventsService.remove).toHaveBeenCalledWith(1, req.user);
  });
});
