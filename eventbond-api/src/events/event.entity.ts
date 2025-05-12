import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Category } from '../categories/categories.entity';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  creatorId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  description: string;

  @Column()
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Column()
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @Column()
  @IsString()
  @IsNotEmpty()
  venue: string;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
