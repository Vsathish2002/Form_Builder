import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // auth.controller.ts

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string; role?: string }
  ) {
    // Register the user
    const user = await this.authService.register(body.name, body.email, body.password, body.role);

    // Generate JWT token immediately
    const loginResult = await this.authService.login(user);

    // Return token and user info
    return {
      message: 'User registered successfully',
      access_token: loginResult.access_token,
      user: loginResult.user,
    };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
