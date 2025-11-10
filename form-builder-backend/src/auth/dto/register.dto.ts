import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Sathish', description: 'Full name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'vsathish22120@gmail.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123', description: 'Password with at least 6 characters' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'user', required: false, description: 'Optional user role' })
  role?: string;
}
