import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConsoleLogger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventImage } from './event-image.entity';
import { Event } from './event.entity';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { resolve, basename } from 'path';
import { File as MulterFile } from 'multer';

@Injectable()
export class EventImageService {
  private readonly uploadDir = resolve(process.cwd(), 'eventbond-uploads');
  private readonly logger = new ConsoleLogger(EventImageService.name);

  constructor(
    @InjectRepository(EventImage)
    private readonly eventImageRepository: Repository<EventImage>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    if (!existsSync(this.uploadDir)) {
      this.logger.log(`Upload directory ${this.uploadDir} not found. Creating...`);
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    eventId: number,
    file: MulterFile,
    isPrimary = false,
  ): Promise<EventImage> {
    this.logger.log(`uploadImage service: eventId=${eventId}, file=${file?.originalname}, isPrimary=${isPrimary}`);
    if (!file) {
      this.logger.error('uploadImage service: No file provided for upload.');
      throw new BadRequestException('No file uploaded');
    }
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      this.logger.error(`uploadImage service: Event with id ${eventId} not found.`);
      throw new NotFoundException('Event not found');
    }

    const relativeImageUrl = file.filename;
    const altText = basename(file.originalname);
    this.logger.log(`uploadImage service: relativeImageUrl=${relativeImageUrl}, altText=${altText}`);

    const eventImageToCreate = {
      event: event, 
      eventId: eventId,
      imageUrl: relativeImageUrl,
      altText,
      isPrimary,
    };
    this.logger.log(`uploadImage service: Attempting to create event image entity: ${JSON.stringify(eventImageToCreate)}`);

    let savedImage: EventImage;
    await this.eventImageRepository.manager.transaction(async transactionalEntityManager => {
      if (isPrimary) {
        this.logger.log(`uploadImage service: Setting isPrimary=true. Demoting other primary images for event ${eventId}.`);
        await transactionalEntityManager.update(
          EventImage,
          { eventId: eventId, isPrimary: true },
          { isPrimary: false },
        );
      }
      const newImageEntity = transactionalEntityManager.create(EventImage, eventImageToCreate);
      savedImage = await transactionalEntityManager.save(newImageEntity);
      this.logger.log(`uploadImage service: Image saved with id ${savedImage.id} for event ${eventId}. Url: ${savedImage.imageUrl}, Primary: ${savedImage.isPrimary}`);
    });
    
    if (!savedImage) {
        this.logger.error(`uploadImage service: Failed to save image for event ${eventId}, savedImage is undefined after transaction.`);
        throw new Error('Image saving failed after transaction.');
    }
    return savedImage; 
  }

  async setPrimaryImage(imageId: number): Promise<EventImage> {
    this.logger.log(`setPrimaryImage service: imageId=${imageId}`);
    const imageToSetPrimary = await this.eventImageRepository.findOne({ 
      where: { id: imageId },
      relations: ['event']
    });

    if (!imageToSetPrimary) {
      this.logger.error(`setPrimaryImage service: Image with id ${imageId} not found.`);
      throw new NotFoundException('Image not found');
    }
    
    const eventId = imageToSetPrimary.eventId;
    this.logger.log(`setPrimaryImage service: EventId ${eventId} found for image ${imageId}.`);

    await this.eventImageRepository.manager.transaction(async transactionalEntityManager => {
      this.logger.log(`setPrimaryImage service: Demoting other primary images for event ${eventId}.`);
      await transactionalEntityManager.update(
        EventImage,
        { eventId: eventId, isPrimary: true },
        { isPrimary: false },
      );

      imageToSetPrimary.isPrimary = true;
      await transactionalEntityManager.save(EventImage, imageToSetPrimary);
      this.logger.log(`setPrimaryImage service: Image ${imageId} set to primary for event ${eventId}.`);
    });
    
    return imageToSetPrimary; 
  }

  async getImagesByEvent(eventId: number): Promise<EventImage[]> {
    this.logger.log(`getImagesByEvent service: eventId=${eventId}`);
    const images = await this.eventImageRepository.find({
      where: { event: { id: eventId } },
    });
    this.logger.log(`getImagesByEvent service: Found ${images.length} images for event ${eventId}.`);
    return images;
  }

  async getImage(id: number): Promise<EventImage> {
    this.logger.log(`getImage service: id=${id}`);
    const image = await this.eventImageRepository.findOne({ where: { id } });
    if (!image) {
      this.logger.error(`getImage service: Image with id ${id} not found.`);
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  async deleteImage(id: number): Promise<void> {
    this.logger.log(`deleteImage service: id=${id}`);
    const image = await this.getImage(id);
    const imagePath = resolve(this.uploadDir, image.imageUrl);
    
    this.logger.log(`deleteImage service: Attempting to delete physical file at ${imagePath}`);
    if (existsSync(imagePath)) {
      try {
        unlinkSync(imagePath);
        this.logger.log(`deleteImage service: Successfully deleted physical file ${imagePath}`);
      } catch (err) {
        this.logger.error(`deleteImage service: Error deleting physical file ${imagePath}`, err);
      }
    } else {
      this.logger.warn(`deleteImage service: Physical file not found at ${imagePath}, skipping unlink.`);
    }
    await this.eventImageRepository.delete(id);
    this.logger.log(`deleteImage service: Deleted image record with id ${id} from database.`);
  }
}
