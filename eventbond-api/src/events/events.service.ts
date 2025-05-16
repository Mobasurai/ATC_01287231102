import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConsoleLogger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/users.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const transformEventResponse = (event: Event): any => {
  const { creator, ...restOfEvent } = event;
  const creatorInfo = creator ? { id: creator.id, username: creator.username } : null;
  return {
    ...restOfEvent,
    creator: creatorInfo,
    images: event.images || [],
    category: event.category || null,
  };
};

const transformEventsResponse = (events: Event[]): any[] => {
  return events.map(event => transformEventResponse(event));
};

@Injectable()
export class EventsService {
  private readonly logger = new ConsoleLogger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(): Promise<Event[]> {
    const events = await this.eventsRepository.find({ relations: ['images', 'category', 'creator'] });
    return transformEventsResponse(events) as Event[];
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.eventsRepository.findAndCount({
      relations: ['images', 'category', 'creator'],
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'DESC' },
    });
    this.logger.log(`findAllPaginated - Found ${data.length} events. First event images count: ${data[0]?.images?.length}`);
    return { data: transformEventsResponse(data), total, page, limit };
  }

  async findOne(id: number): Promise<any> {
    this.logger.log(`findOne - Attempting to find event with id: ${id}`);
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['images', 'category', 'creator'],
    });
    
    if (!event) {
      this.logger.warn(`findOne - Event with id: ${id} not found.`);
      throw new NotFoundException('Event not found');
    }

    this.logger.log(`findOne - Event found: ${event.title}. Number of images directly from query: ${event.images ? event.images.length : 'undefined'}`);
    if (event.images && event.images.length > 0) {
      this.logger.log(`findOne - Image details for event ${id}: ${JSON.stringify(event.images.map(img => ({id: img.id, url: img.imageUrl, primary: img.isPrimary}))) }`);
    }

    return transformEventResponse(event);
  }

  async create(eventData: CreateEventDto, user: User): Promise<any> {
    if (user.role !== 'admin')
      throw new ForbiddenException('Action is forbidden');
    const newEvent = this.eventsRepository.create({
      ...eventData,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      creatorId: user.id,
      categoryId: eventData.categoryId,
    });
    const savedEvent = await this.eventsRepository.save(newEvent);
    this.logger.log(`create - Event created with id: ${savedEvent.id}. Now fetching with relations.`);
    return this.findOne(savedEvent.id);
  }

  async update(
    id: number,
    eventData: UpdateEventDto,
    user: User,
  ): Promise<any> {
    const eventToUpdate = await this.eventsRepository.findOne({ where: {id}, relations: ['images', 'category', 'creator']});
    if (!eventToUpdate) {
      this.logger.warn(`update - Event with id: ${id} not found for update.`);
      throw new NotFoundException('Event not found for update');
    }

    if (user.role !== 'admin')
      throw new ForbiddenException('Action is forbidden');
    
    Object.assign(eventToUpdate, {
      ...eventData,
      ...(eventData.startDate && { startDate: new Date(eventData.startDate) }),
      ...(eventData.endDate && { endDate: new Date(eventData.endDate) }),
    });
    const updatedEvent = await this.eventsRepository.save(eventToUpdate);
    this.logger.log(`update - Event updated with id: ${updatedEvent.id}. Now fetching with relations.`);
    return this.findOne(updatedEvent.id);
  }

  async remove(id: number, user: User): Promise<void> {
    const event = await this.eventsRepository.findOne({ where: { id } }); 
    if (!event) {
      this.logger.warn(`remove - Event with id: ${id} not found.`);
      throw new NotFoundException('Event not found');
    }
    if (user.role !== 'admin')
      throw new ForbiddenException('Action is forbidden');
    await this.eventsRepository.remove(event);
    this.logger.log(`remove - Event with id: ${id} removed.`);
  }

  async searchEvents(
    searchText?: string,
    categoryId?: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (searchText) {
      where.title = ILike(`%${searchText}%`);
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const [data, total] = await this.eventsRepository.findAndCount({
      where,
      relations: ['images', 'category', 'creator'],
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'DESC' },
    });
    this.logger.log(`searchEvents - Found ${data.length} events. First event images count: ${data[0]?.images?.length}`);
    return { data: transformEventsResponse(data), total, page, limit };
  }
}
