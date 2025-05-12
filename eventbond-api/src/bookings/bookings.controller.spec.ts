import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';

const mockBookingsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockUsersService = {
  findUserById: jest.fn(),
};

const mockEventsService = {
  findOne: jest.fn(),
};

describe('BookingsController', () => {
  let controller: BookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a booking', async () => {
    mockUsersService.findUserById.mockResolvedValue({ id: 1 });
    mockEventsService.findOne.mockResolvedValue({ id: 2 });
    mockBookingsService.create.mockResolvedValue({
      id: 1,
      user: { id: 1 },
      event: { id: 2 },
    });
    const result = await controller.createBooking(1, 2);
    expect(result).toEqual({ id: 1, user: { id: 1 }, event: { id: 2 } });
  });

  it('should get all bookings', async () => {
    mockBookingsService.findAll.mockResolvedValue(['booking1', 'booking2']);
    const result = await controller.getBookings();
    expect(result).toEqual(['booking1', 'booking2']);
  });

  it('should get a booking by id', async () => {
    mockBookingsService.findOne.mockResolvedValue('booking1');
    const result = await controller.getBooking(1);
    expect(result).toBe('booking1');
  });

  it('should remove a booking', async () => {
    mockBookingsService.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1)).resolves.toBeUndefined();
  });
});
