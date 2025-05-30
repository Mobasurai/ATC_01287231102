import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EventsService } from '../events/events.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly eventsService: EventsService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  @Post('/createBooking')
  async createBooking(@Body('eventId') eventId: number, @Request() req) {
    const user = req.user;
    const event = await this.eventsService.findOne(eventId);
    return this.bookingsService.create(user, event);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('/getBookings')
  async getBookings() {
    return this.bookingsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'admin')
  @Get('/getUserBookings')
  async getUserBookings(@Request() req) {
    return this.bookingsService.findByUserId(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('/getBooking/:id')
  async getBooking(@Param('id') id: number) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('/removeBooking/:id')
  async remove(@Param('id') id: number) {
    return this.bookingsService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Delete('/removeOwnBooking/:id')
  async removeOwnBooking(@Param('id') id: number, @Request() req) {
    return this.bookingsService.removeByUser(id, req.user.id);
  }
}
