import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/users.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.eventsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(eventData: CreateEventDto, user: User): Promise<Event> {
    if (user.role !== 'admin')
      throw new ForbiddenException('Action is forbidden');
    const event = this.eventsRepository.create({
      ...eventData,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      creatorId: user.id,
      categoryId: eventData.categoryId, // ensure categoryId is set
    });
    return this.eventsRepository.save(event);
  }

  async update(
    id: number,
    eventData: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.findOne(id);
    if (user.role !== 'admin')
      throw new ForbiddenException('Action is forbidden');
    Object.assign(event, {
      ...eventData,
      ...(eventData.startDate && { startDate: new Date(eventData.startDate) }),
      ...(eventData.endDate && { endDate: new Date(eventData.endDate) }),
    });
    return this.eventsRepository.save(event);
  }

  async remove(id: number, user: User): Promise<void> {
    const event = await this.findOne(id);
    if (user.role !== 'admin')
      throw new ForbiddenException('Action is forbidden');
    await this.eventsRepository.remove(event);
  }

  async searchEvents(
    searchText?: string,
    categoryId?: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (searchText) {
      where.title = Like(`%${searchText}%`);
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const [data, total] = await this.eventsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { startDate: 'DESC' },
    });
    return { data, total, page, limit };
  }
}
