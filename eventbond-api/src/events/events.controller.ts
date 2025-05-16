import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/getEvents')
  @Roles('admin', 'user')
  async getEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const numPage = Number(page) || 1;
    const numLimit = Number(limit) || 10;
    return this.eventsService.findAllPaginated(numPage, numLimit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/getEvent/:id')
  @Roles('admin', 'user')
  async getEvent(@Param('id') id: number) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/createEvent')
  @Roles('admin')
  async createEvent(@Body() eventData: CreateEventDto, @Request() req) {
    return this.eventsService.create(eventData, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('/updateEvent/:id')
  @Roles('admin')
  async updateEvent(
    @Param('id') id: number,
    @Body() eventData: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.update(id, eventData, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('/deleteEvent/:id')
  @Roles('admin')
  async deleteEvent(@Param('id') id: number, @Request() req) {
    return this.eventsService.remove(id, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/searchEvents')
  @Roles('admin', 'user')
  async searchEvents(
    @Query('searchText') searchText?: string,
    @Query('categoryId') categoryId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const numPage = Number(page) || 1;
    const numLimit = Number(limit) || 10;
    const numCategoryId = categoryId ? Number(categoryId) : undefined;
    return this.eventsService.searchEvents(searchText, numCategoryId, numPage, numLimit);
  }
}
