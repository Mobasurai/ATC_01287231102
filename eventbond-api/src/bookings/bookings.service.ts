import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    const savedBooking = await this.bookingsRepository.save(booking);
    return this.bookingsRepository.findOne({
      where: { id: savedBooking.id },
      relations: ['user', 'event', 'event.images', 'event.category'],
    });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['user', 'event', 'event.images', 'event.category'],
    });
  }

  async findOne(id: number): Promise<Booking> {
    return this.bookingsRepository.findOne({
      where: { id },
      relations: ['user', 'event', 'event.images', 'event.category'],
    });
  }

  async findByUserId(userId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'event', 'event.images', 'event.category'],
      order: { createdAt: 'DESC' }
    });
  }

  async removeByUser(bookingId: number, userId: number): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    if (booking.user.id !== userId) {
      throw new ForbiddenException('You are not authorized to delete this booking.');
    }
    await this.bookingsRepository.delete(bookingId);
  }

  async remove(id: number): Promise<void> {
    await this.bookingsRepository.delete(id);
  }
}
