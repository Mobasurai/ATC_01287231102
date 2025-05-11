import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createUser(dto: CreateUserDto): Promise<User> {
        if (dto.password) {
            const saltRounds = 10;
            dto.password = await bcrypt.hash(dto.password, saltRounds);
        }
        const newUser = this.userRepository.create(dto);
        return await this.userRepository.save(newUser);
    }
    async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
        if (dto.password) {
            const saltRounds = 10;
            dto.password = await bcrypt.hash(dto.password, saltRounds);
        }
        await this.userRepository.update(id, dto);
        return await this.userRepository.findOneBy({ id });
    }
    async deleteUser(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
    async findAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }
    async findUserById(id: number): Promise<User> {
        return await this.userRepository.findOneBy({ id });
    }
}
