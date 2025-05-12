import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';

@Entity()
export class EventImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  altText: string;

  @Column({ default: false })
  @IsBoolean()
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
