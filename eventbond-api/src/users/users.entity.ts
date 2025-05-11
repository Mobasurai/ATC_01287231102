import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { IsEmail, IsNotEmpty, IsString, IsDate } from "class-validator";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @Column({ unique: true })
    @IsEmail()
    email: string;
    
    @Column()
    @IsString()
    @IsNotEmpty()
    password: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    role: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
