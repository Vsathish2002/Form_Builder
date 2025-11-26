import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    updateUser: jest.fn(),
    sendEmailChangeOtp: jest.fn(),
    verifyEmailChangeOtp: jest.fn(),
  };


  const mockJwtGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  // ✅ Basic definition test
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ✅ Get all users (admin)
  describe('getAllUsers', () => {
    it('should return all users (admin only)', async () => {
      const users = [{ id: '1', name: 'User One' }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  // ✅ Update user
  describe('updateUser', () => {
    it('should allow user to update own profile', async () => {
      const req = { user: { id: '1', role: { name: 'user' } } };
      const body = { name: 'Updated' };
      const updated = { message: 'Profile updated successfully' };
      mockUsersService.updateUser.mockResolvedValue(updated);

      const result = await controller.updateUser('1', body, req);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith('1', body);
      expect(result).toEqual(updated);
    });

    it('should allow admin to update any profile', async () => {
      const req = { user: { id: '2', role: { name: 'admin' } } };
      const body = { name: 'Admin Updated' };
      const updated = { message: 'Profile updated successfully' };
      mockUsersService.updateUser.mockResolvedValue(updated);

      const result = await controller.updateUser('1', body, req);

      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException if non-admin tries to update another user', async () => {
      const req = { user: { id: '2', role: { name: 'user' } } };
      const body = { name: 'Unauthorized Change' };

      await expect(controller.updateUser('1', body, req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ✅ Request Email OTP
  describe('requestEmailOtp', () => {
    it('should send OTP successfully', async () => {
      const id = '1';
      const body = { newEmail: 'new@example.com' };
      const response = { message: 'OTP sent to new email for verification' };

      mockUsersService.sendEmailChangeOtp.mockResolvedValue(response);

      const result = await controller.requestEmailOtp(id, body);

      expect(mockUsersService.sendEmailChangeOtp).toHaveBeenCalledWith(id, body.newEmail);
      expect(result).toEqual(response);
    });

    it('should throw BadRequestException if newEmail missing', async () => {
      const id = '1';
      const body = {};

      await expect(controller.requestEmailOtp(id, body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ✅ Verify Email OTP
  describe('verifyEmailOtp', () => {
    it('should verify OTP successfully', async () => {
      const id = '1';
      const body = { newEmail: 'new@example.com', otp: '123456' };
      const response = { message: 'Email updated successfully' };

      mockUsersService.verifyEmailChangeOtp.mockResolvedValue(response);

      const result = await controller.verifyEmailOtp(id, body);

      expect(mockUsersService.verifyEmailChangeOtp).toHaveBeenCalledWith(
        id,
        body.newEmail,
        body.otp,
      );
      expect(result).toEqual(response);
    });

    it('should throw BadRequestException if email or otp missing', async () => {
      const id = '1';
      const body = { newEmail: 'new@example.com' };

      await expect(controller.verifyEmailOtp(id, body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
