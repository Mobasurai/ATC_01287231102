import { Test, TestingModule } from '@nestjs/testing';
import { EventImageService } from './event-image.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventImage } from './event-image.entity';
import { Event } from './event.entity';
import * as fs from 'fs';

const mockEventImageRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockEventRepository = {
  findOne: jest.fn(),
};

describe('EventImageService', () => {
  let service: EventImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventImageService,
        {
          provide: getRepositoryToken(EventImage),
          useValue: mockEventImageRepository,
        },
        { provide: getRepositoryToken(Event), useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<EventImageService>(EventImageService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload an image', async () => {
    mockEventRepository.findOne.mockResolvedValue({ id: 1 });
    mockEventImageRepository.create.mockReturnValue({ id: 1 });
    mockEventImageRepository.save.mockResolvedValue({ id: 1 });
    const file = { filename: 'test.jpg', originalname: 'test.jpg' } as any;
    const result = await service.uploadImage(1, file, true);
    expect(result).toEqual({ id: 1 });
  });

  it('should get images by event', async () => {
    mockEventImageRepository.find.mockResolvedValue([{ id: 1 }]);
    const result = await service.getImagesByEvent(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should get image by id', async () => {
    mockEventImageRepository.findOne.mockResolvedValue({ id: 1 });
    const result = await service.getImage(1);
    expect(result).toEqual({ id: 1 });
  });

  it('should delete image', async () => {
    mockEventImageRepository.findOne.mockResolvedValue({
      id: 1,
      imageUrl: 'E:/EventBond/eventbond-uploads/test.jpg',
    });
    mockEventImageRepository.delete.mockResolvedValue(undefined);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockReturnValue(undefined);
    await expect(service.deleteImage(1)).resolves.toBeUndefined();
  });
});
