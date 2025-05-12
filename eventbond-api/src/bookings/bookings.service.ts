import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './bookings.entity';
import { User } from '../users/users.entity';
import { Event } from '../events/event.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(user: User, event: Event): Promise<Booking> {
    const booking = this.bookingsRepository.create({ user, event });
    return this.bookingsRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find();
  }

  async findOne(id: number): Promise<Booking> {
    return this.bookingsRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({ where: { user: { id: userId } } });
  }

  async removeByUser(bookingId: number, userId: number): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });
    if (!booking || booking.user.id !== userId) {
      throw new Error('Action is forbidden');
    }
    await this.bookingsRepository.delete(bookingId);
  }

  async remove(id: number): Promise<void> {
    await this.bookingsRepository.delete(id);
  }
}
