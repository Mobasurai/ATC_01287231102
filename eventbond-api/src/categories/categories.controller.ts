import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/getCategories')
  async getCategories() {
    return this.categoriesService.findAll();
  }

  @Get('/getCategory/:id')
  async getCategory(@Param('id') id: string) {
    return this.categoriesService.findOne(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/createCategory')
  async createCategory(@Body('name') name: string, @Request() req) {
    return this.categoriesService.create(name, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('/updateCategory/:id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(Number(id));
  }
}
