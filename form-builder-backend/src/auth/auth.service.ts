import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  // Register user
  async register(
    name: string,
    email: string,
    password: string,
    role: string = 'user', // default role
  ): Promise<User> {
    // Validate password strength: at least 6 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already exists');

    // Call createUser method from UsersService
    const user = await this.usersService.createUser(name, email, password, role);
    return user;
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    await this.usersService.updateUserResetToken(user.id, hashedOtp, expiry);

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'OTP sent to your email' };
  }

  // Verify OTP
  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetToken);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  // Reset password
  async resetPassword(email: string, otp: string, newPassword: string) {
    // Validate password strength: at least 6 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestException('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetToken);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.usersService.updateUserPassword(user.id, hashedPassword);
    await this.usersService.clearResetToken(user.id);

    return { message: 'Password reset successfully' };
  }

  // ✅ 1. Send OTP before registration
  async sendRegisterOtp(email: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);


    (global as any).pendingOtps = (global as any).pendingOtps || {};
    (global as any).pendingOtps[email] = { otp: hashedOtp, expiry };

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'OTP sent for registration verification' };
  }

  // ✅ 2. Verify OTP and create user
  async verifyRegisterOtp(
    name: string,
    email: string,
    password: string,
    otp: string,
  ) {
    const pending = (global as any).pendingOtps?.[email];
    if (!pending) throw new BadRequestException('No OTP requested for this email');

    if (new Date() > pending.expiry) {
      delete (global as any).pendingOtps[email];
      throw new BadRequestException('OTP expired');
    }

    const isValid = await bcrypt.compare(otp, pending.otp);
    if (!isValid) throw new BadRequestException('Invalid OTP');

    // ✅ Create user now
    const user = await this.register(name, email, password, 'user');
    delete (global as any).pendingOtps[email];

    // Auto login after registration
    const loginResult = await this.login(user);
    return {
      message: 'Registration successful',
      access_token: loginResult.access_token,
      user: loginResult.user,
    };
  }

 
  // Login user and return JWT
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role.name };

    // Ensure expiresIn is a number
    const expiresIn = parseInt(process.env.JWT_EXPIRATION || '86400', 10);

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }
}
