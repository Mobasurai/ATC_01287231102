import { ConflictException, Injectable, NotFoundException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(UsersService.name);

  async createAdminFromEnv(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminUsername || !adminPassword) {
      this.logger.warn('Admin credentials not found in .env file. Skipping admin user creation.');
      return;
    }

    const existingAdmin = await this.userRepository.findOneBy({ email: adminEmail });
    if (existingAdmin) {
      this.logger.log('Admin user already exists.');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const adminUser = this.userRepository.create({
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
    });

    await this.userRepository.save(adminUser);
    this.logger.log('Admin user created successfully from .env credentials.');
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    if (dto.password) {
      const saltRounds = 10;
      dto.password = await bcrypt.hash(dto.password, saltRounds);
    }
    if (dto.email) {
      const existingUser = await this.userRepository.findOneBy({
        email: dto.email,
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }
    }
    const newUser = this.userRepository.create(dto);
    return await this.userRepository.save(newUser);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    if (dto.password) {
      const saltRounds = 10;
      dto.password = await bcrypt.hash(dto.password, saltRounds);
    }
    if (dto.email === undefined) delete dto.email;
    if (dto.username === undefined) delete dto.username;

    await this.userRepository.update(id, dto);
    return await this.userRepository.findOneBy({ id });
  }

  async updateUserByAdmin(id: number, dto: UpdateUserDto): Promise<User> {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (dto.password) {
      const saltRounds = 10;
      dto.password = await bcrypt.hash(dto.password, saltRounds);
    } else {
      delete dto.password;
    }

    const updatePayload: Partial<User> = {};
    if (dto.username !== undefined) updatePayload.username = dto.username;
    if (dto.email !== undefined) updatePayload.email = dto.email;
    if (dto.password !== undefined) updatePayload.password = dto.password;
    if (dto.role !== undefined) updatePayload.role = dto.role;

    if (Object.keys(updatePayload).length === 0) {
        return userToUpdate;
    }

    await this.userRepository.update(id, updatePayload);
    return await this.userRepository.findOneBy({ id });
  }

  async deleteUser(id: number): Promise<void> {
    const userToDelete = await this.userRepository.findOneBy({ id });
    if (!userToDelete) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    await this.userRepository.delete(id);
  }

  async deleteUserByAdmin(idToDelete: number, adminUserId: number): Promise<void> {
    if (idToDelete === adminUserId) {
      throw new ForbiddenException('Admins cannot delete their own account through this function.');
    }
    const userToDelete = await this.userRepository.findOneBy({ id: idToDelete });
    if (!userToDelete) {
      throw new NotFoundException(`User with ID "${idToDelete}" not found`);
    }
    await this.userRepository.delete(idToDelete);
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }
}
