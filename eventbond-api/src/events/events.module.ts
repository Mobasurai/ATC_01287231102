import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { UsersModule } from '../users/users.module';
import { Category } from '../categories/categories.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Category]), UsersModule],
  providers: [EventsService, RolesGuard, JwtStrategy],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
