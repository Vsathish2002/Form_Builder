import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'sathish@example.com', description: 'Email for password reset' })
  @IsEmail()
  email: string;
}
