import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './categories.entity';
import { User } from '../users/users.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepository.find({ relations: ['createdBy'] });
  }

  async findOne(id: number) {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async create(name: string, createdBy: User) {
    const existingCategory = await this.categoryRepository.findOne({ where: { name } });
    if (existingCategory) {
      throw new ConflictException(`Category with name '${name}' already exists.`);
    }

    const category = this.categoryRepository.create({ name, createdBy });
    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id);
  }
}
