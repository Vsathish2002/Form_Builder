import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'sathish@example.com', description: 'Email address used for OTP' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP code sent to email' })
  @IsString()
  otp: string;
}
