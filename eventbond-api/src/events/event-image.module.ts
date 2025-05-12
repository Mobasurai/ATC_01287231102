import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventImage } from './event-image.entity';
import { Event } from './event.entity';
import { EventImageService } from './event-image.service';
import { EventImageController } from './event-image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventImage, Event])],
  providers: [EventImageService],
  controllers: [EventImageController],
  exports: [EventImageService],
})
export class EventImageModule {}
