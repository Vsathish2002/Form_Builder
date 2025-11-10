import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'vsathish22120@gmail.com', description: 'Email for password reset' })
  @IsEmail()
  email: string;
}
