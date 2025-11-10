// users.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Put,
  Post,
  Param,
  Body,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BadRequestException } from '@nestjs/common';
import { ApiExcludeController,ApiExcludeEndpoint } from '@nestjs/swagger';



@UseGuards(JwtAuthGuard, RolesGuard)
@ApiExcludeController()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  // 👑 Admin-only: get all users
  @Get()
  @Roles('admin')
  getAllUsers() {
    return this.usersService.findAll();
  }

  // 👤 Authenticated user: update profile
  @Put('update/:id')
  async updateUser(@Param('id') id: string, @Body() body: any, @Request() req) {
    // Prevent normal users from updating others
    if (req.user.id !== id && req.user.role.name !== 'admin') {
      throw new ForbiddenException('You can only update your own profile.');
    }

    return this.usersService.updateUser(id, body);
  }

  @Post('request-email-otp/:id')
  async requestEmailOtp(@Param('id') id: string, @Body() body: any) {
    const { newEmail } = body;
    if (!newEmail) throw new BadRequestException('New email is required');

    return this.usersService.sendEmailChangeOtp(id, newEmail);
  }
  @ApiExcludeEndpoint()
  @Post('verify-email-otp/:id')
  async verifyEmailOtp(@Param('id') id: string, @Body() body: any) {
    const { newEmail, otp } = body;
    if (!newEmail || !otp)
      throw new BadRequestException('Email and OTP required');

    return this.usersService.verifyEmailChangeOtp(id, newEmail, otp);
  }
}
