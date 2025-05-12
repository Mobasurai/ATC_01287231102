import { Test, TestingModule } from '@nestjs/testing';
import { EventImageController } from './event-image.controller';
import { EventImageService } from './event-image.service';

const mockEventImageService = {
  uploadImage: jest.fn(),
  getImagesByEvent: jest.fn(),
  getImage: jest.fn(),
  deleteImage: jest.fn(),
};

describe('EventImageController', () => {
  let controller: EventImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventImageController],
      providers: [
        { provide: EventImageService, useValue: mockEventImageService },
      ],
    }).compile();

    controller = module.get<EventImageController>(EventImageController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should upload an image', async () => {
    mockEventImageService.uploadImage.mockResolvedValue({ id: 1 });
    const result = await controller.uploadImage(
      1,
      { filename: 'test.jpg', originalname: 'test.jpg' } as any,
      true,
    );
    expect(result).toEqual({ id: 1 });
  });

  it('should get images by event', async () => {
    mockEventImageService.getImagesByEvent.mockResolvedValue([{ id: 1 }]);
    const result = await controller.getImagesByEvent(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should delete image', async () => {
    mockEventImageService.deleteImage.mockResolvedValue(undefined);
    await expect(controller.deleteImage(1)).resolves.toBeUndefined();
  });
});
