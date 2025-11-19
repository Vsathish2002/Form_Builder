import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth (Login Authentication)')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  async register(@Body() body: RegisterDto) {
    try {
      const user = await this.authService.register(
        body.name,
        body.email,
        body.password,
        body.role,
      );

      const loginResult = await this.authService.login(user);
      return {
        message: 'User registered successfully',
        access_token: loginResult.access_token,
        user: loginResult.user,
      };
    } catch (error) {
      // Handle duplicate registration
      if (
        error.message.includes('exists') ||
        error.message.includes('duplicate') ||
        error.code === '23505' // for Postgres unique constraint
      ) {
        throw new HttpException('User already registered', HttpStatus.CONFLICT);
      }

      throw new HttpException(
        error.message || 'Registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('register-request-otp')
  async registerRequestOtp(@Body() body: RegisterDto) {
    try {
      return await this.authService.sendRegisterOtp(body.email);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send OTP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('register-verify-otp')
  async registerVerifyOtp(@Body() body: any) {
    try {
      return await this.authService.verifyRegisterOtp(
        body.name,
        body.email,
        body.password, 
        body.otp,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Invalid OTP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        body.email,
        body.password,
      );

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      return this.authService.login(user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      const result = await this.authService.forgotPassword(body.email);

      if (!result) {
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send OTP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    try {
      const result = await this.authService.verifyOtp(body.email, body.otp);

      if (!result) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Invalid OTP',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password after OTP verification' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'OTP invalid or expired' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      const result = await this.authService.resetPassword(
        body.email,
        body.otp,
        body.newPassword,
      );

      if (!result) {
        throw new HttpException(
          'OTP invalid or expired',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reset password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  @ApiOperation({ summary: 'Get currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched successfully' })
  async getProfile(@Request() req) {
    try {
      return req.user;
    } catch (error) {
      throw new HttpException(
        'Unable to fetch user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
