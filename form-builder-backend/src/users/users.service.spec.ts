import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { EmailService } from '../auth/email.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let roleRepo: jest.Mocked<Repository<Role>>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPass',
    role: { id: 1, name: 'user' } as Role,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: createMockRepo() },
        { provide: getRepositoryToken(Role), useValue: createMockRepo() },
        { provide: EmailService, useValue: { sendOtpEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
    emailService = module.get(EmailService);

    jest.clearAllMocks();
  });

  // Helper function for mock repository
  function createMockRepo() {
    return {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
  }

  // ✅ Test: service definition
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ createUser
  describe('createUser', () => {
    it('should create user successfully', async () => {
      const role = { id: 1, name: 'user' } as Role;
      roleRepo.findOneBy.mockResolvedValue(role);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPass');
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.createUser('Test', 'test@example.com', '123456', 'user');

      expect(roleRepo.findOneBy).toHaveBeenCalledWith({ name: 'user' });
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedPass',
        role,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if role not found', async () => {
      roleRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.createUser('Test', 'test@example.com', '123456', 'invalidRole'),
      ).rejects.toThrow(Error);
    });
  });

  // ✅ findByEmail
  describe('findByEmail', () => {
    it('should return user if found', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  // ✅ findAll
  describe('findAll', () => {
    it('should return all users', async () => {
      userRepo.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  // ✅ updateUser
  describe('updateUser', () => {
    it('should update user successfully', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue({ ...mockUser, name: 'Updated' });

      const result = await service.updateUser('1', { name: 'Updated' });

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['role'] });
      expect(userRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('Profile updated successfully');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.updateUser('1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  // ✅ sendEmailChangeOtp
  describe('sendEmailChangeOtp', () => {
    it('should send OTP successfully', async () => {
  jest.spyOn(service, 'findByEmail').mockResolvedValue(null); // 👈 important fix

  (bcrypt.hash as jest.Mock).mockResolvedValue('hashedOtp');
  emailService.sendOtpEmail.mockResolvedValue(undefined);

  const result = await service.sendEmailChangeOtp('1', 'new@example.com');

  expect(emailService.sendOtpEmail).toHaveBeenCalledWith('new@example.com', expect.any(String));
  expect(result).toEqual({ message: 'OTP sent to new email for verification' });
});


    it('should throw BadRequestException if email already exists', async () => {
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);

      await expect(service.sendEmailChangeOtp('1', 'test@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ✅ verifyEmailChangeOtp
  describe('verifyEmailChangeOtp', () => {
    beforeEach(() => {
      (global as any).pendingEmailOtps = {
        '1': {
          newEmail: 'new@example.com',
          otp: 'hashedOtp',
          expiry: new Date(Date.now() + 60000),
        },
      };
    });

    it('should verify OTP and update email', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepo.findOne.mockResolvedValue({ ...mockUser, email: 'new@example.com' });

      const result = await service.verifyEmailChangeOtp('1', 'new@example.com', '123456');

      expect(userRepo.update).toHaveBeenCalledWith('1', { email: 'new@example.com' });
      expect(result.message).toBe('Email updated successfully');
    });

    it('should throw BadRequestException if OTP expired', async () => {
      (global as any).pendingEmailOtps['1'].expiry = new Date(Date.now() - 60000);

      await expect(
        service.verifyEmailChangeOtp('1', 'new@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if invalid OTP', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyEmailChangeOtp('1', 'new@example.com', 'wrongotp'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
