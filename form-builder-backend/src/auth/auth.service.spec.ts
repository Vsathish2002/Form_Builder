import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { User } from '../users/user.entity';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: { id: 1, name: 'user' } as any,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersServiceValue = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUserResetToken: jest.fn(),
      updateUserPassword: jest.fn(),
      clearResetToken: jest.fn(),
    };

    const mockJwtServiceValue = {
      sign: jest.fn(),
    };

    const mockEmailServiceValue = {
      sendOtpEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersServiceValue },
        { provide: JwtService, useValue: mockJwtServiceValue },
        { provide: EmailService, useValue: mockEmailServiceValue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get(UsersService);
    mockJwtService = module.get(JwtService);
    mockEmailService = module.get(EmailService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const password = 'Password123';
      const role = 'user';

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await service.register(name, email, password, role);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(name, email, password, role);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register('Test', 'test@example.com', 'Password123')).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for weak password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.register('Test', 'test@example.com', 'weak')).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'Password123';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP successfully', async () => {
      const email = 'test@example.com';
      const otp = '211110'; // Calculated based on mocked Math.random: Math.floor(100000 + 0.123456 * 900000) = 211110
      const hashedOtp = 'hashedOtp';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedOtp);
      mockUsersService.updateUserResetToken.mockResolvedValue(undefined);
      mockEmailService.sendOtpEmail.mockResolvedValue(undefined);

      // Mock Math.random to control OTP generation
      jest.spyOn(Math, 'random').mockReturnValue(0.123456);

      const result = await service.forgotPassword(email);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(otp, 10);
      expect(mockUsersService.updateUserResetToken).toHaveBeenCalledWith(mockUser.id, hashedOtp, expect.any(Date));
      expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith(email, otp);
      expect(result).toEqual({ message: 'OTP sent to your email' });

      // Restore mocks
      jest.restoreAllMocks();
    });

    it('should throw BadRequestException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('test@example.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const userWithToken = { ...mockUser, resetToken: 'hashedOtp', resetTokenExpiry: new Date(Date.now() + 10000) };

      mockUsersService.findByEmail.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyOtp(email, otp);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(otp, userWithToken.resetToken);
      expect(result).toEqual({ message: 'OTP verified successfully' });
    });

    it('should throw BadRequestException if OTP is invalid', async () => {
      const userWithToken = { ...mockUser, resetToken: 'hashedOtp', resetTokenExpiry: new Date(Date.now() + 10000) };

      mockUsersService.findByEmail.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.verifyOtp('test@example.com', 'wrongotp')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP is expired', async () => {
      const userWithToken = { ...mockUser, resetToken: 'hashedOtp', resetTokenExpiry: new Date(Date.now() - 10000) };

      mockUsersService.findByEmail.mockResolvedValue(userWithToken);

      await expect(service.verifyOtp('test@example.com', '123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const newPassword = 'NewPassword123';
      const hashedPassword = 'newHashedPassword';
      const userWithToken = { ...mockUser, resetToken: 'hashedOtp', resetTokenExpiry: new Date(Date.now() + 10000) };

      mockUsersService.findByEmail.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.updateUserPassword.mockResolvedValue(undefined);
      mockUsersService.clearResetToken.mockResolvedValue(undefined);

      const result = await service.resetPassword(email, otp, newPassword);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(otp, userWithToken.resetToken);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUsersService.updateUserPassword).toHaveBeenCalledWith(mockUser.id, hashedPassword);
      expect(mockUsersService.clearResetToken).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw BadRequestException for weak new password', async () => {
      const userWithToken = { ...mockUser, resetToken: 'hashedOtp', resetTokenExpiry: new Date(Date.now() + 10000) };

      mockUsersService.findByEmail.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.resetPassword('test@example.com', '123456', 'weak')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const payload = { email: mockUser.email, sub: mockUser.id, role: mockUser.role.name };
      const token = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(mockUser);

      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: expect.any(Number),
      });
      expect(result).toEqual({
        access_token: token,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role.name,
        },
      });
    });
  });
});
