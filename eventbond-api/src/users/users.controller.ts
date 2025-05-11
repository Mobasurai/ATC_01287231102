import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Get('/getUsers')
    async getUsers() {
        return await this.usersService.findAllUsers();
    }
    @Get('/getUser/:id')
    async getUser(id: number) {
        return await this.usersService.findUserById(id);
    }
    @Post('/createUser')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.createUser(createUserDto);
    }
    @Patch('/updateUser/:id')
    async updateUser(@Param('id') id: number, @Body() user: User) {
        return await this.usersService.updateUser(id, user);
    }
    @Delete('/deleteUser/:id')
    async deleteUser(@Param('id') id: number) {
        return await this.usersService.deleteUser(id);
    }
}
