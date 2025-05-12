import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate: string;

  @IsString()
  @IsOptional()
  venue: string;

  @IsNumber()
  @IsOptional()
  price: number;
}
