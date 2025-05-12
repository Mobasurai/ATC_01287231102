import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventImage } from './event-image.entity';
import { Event } from './event.entity';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { resolve, join, basename } from 'path';
import { File as MulterFile } from 'multer';

@Injectable()
export class EventImageService {
  private readonly uploadDir = resolve(process.cwd(), 'eventbond-uploads'); // External folder

  constructor(
    @InjectRepository(EventImage)
    private readonly eventImageRepository: Repository<EventImage>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    eventId: number,
    file: MulterFile,
    isPrimary = false,
  ): Promise<EventImage> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (!file) throw new BadRequestException('No file uploaded');

    const imageUrl = join(this.uploadDir, file.filename);
    const altText = basename(file.originalname);

    if (isPrimary) {
      await this.eventImageRepository.update(
        { event: { id: eventId }, isPrimary: true },
        { isPrimary: false },
      );
    }

    const eventImage = this.eventImageRepository.create({
      event: event,
      eventId: eventId,
      imageUrl,
      altText,
      isPrimary,
    });
    return this.eventImageRepository.save(eventImage);
  }

  async getImagesByEvent(eventId: number): Promise<EventImage[]> {
    return this.eventImageRepository.find({
      where: { event: { id: eventId } },
    });
  }

  async getImage(id: number): Promise<EventImage> {
    const image = await this.eventImageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.getImage(id);
    if (existsSync(image.imageUrl)) {
      unlinkSync(image.imageUrl);
    }
    await this.eventImageRepository.delete(id);
  }
}
