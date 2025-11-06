import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'sathish@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP for verification' })
  @IsString()
  otp: string;

  @ApiProperty({ example: 'newStrongPassword123', description: 'New password for user' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
