import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './users.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateAdmin } from '../auth/guards/create-admin.guard';
import { OwnerOrAdmin } from '../auth/guards/owner-or-admin.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/getUsers')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async getUsers() {
        return await this.usersService.findAllUsers();
    }

    @Get('/getUser/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    async getUser(@Param('id') id: number) {
        return await this.usersService.findUserById(id);
    }

    @Post('/createUser')
    @UseGuards(CreateAdmin)
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.createUser(createUserDto);
    }

    @Patch('/updateUser/:id')
    @UseGuards(AuthGuard('jwt'), OwnerOrAdmin)
    @Roles('admin', 'user')
    async updateUser(@Param('id') id: number, @Body() user: User) {
        return await this.usersService.updateUser(id, user);
    }

    @Delete('/deleteUser/:id')
    @UseGuards(AuthGuard('jwt'), OwnerOrAdmin)
    @Roles('admin', 'user')
    async deleteUser(@Param('id') id: number) {
        return await this.usersService.deleteUser(id);
    }
}
