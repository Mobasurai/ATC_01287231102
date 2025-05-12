import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './bookings.entity';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { Event } from '../events/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Event]),
    UsersModule,
    EventsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
