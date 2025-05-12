import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './bookings.entity';

const mockBookingsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingsRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a booking', async () => {
    const user = { id: 1 };
    const event = { id: 2 };
    const booking = { id: 1, user, event };
    mockBookingsRepository.create.mockReturnValue(booking);
    mockBookingsRepository.save.mockResolvedValue(booking);
    const result = await service.create(user as any, event as any);
    expect(result).toEqual(booking);
  });

  it('should return all bookings', async () => {
    mockBookingsRepository.find.mockResolvedValue(['booking1', 'booking2']);
    const result = await service.findAll();
    expect(result).toEqual(['booking1', 'booking2']);
  });

  it('should return one booking', async () => {
    mockBookingsRepository.findOne.mockResolvedValue('booking1');
    const result = await service.findOne(1);
    expect(result).toBe('booking1');
  });

  it('should remove a booking', async () => {
    mockBookingsRepository.delete.mockResolvedValue(undefined);
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
});
