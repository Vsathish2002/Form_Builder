import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // 🧩 Mock implementations for AuthService methods used in controller
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    forgotPassword: jest.fn(),
    verifyOtp: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockUsersService = {};
  const mockJwtService = {};
  const mockEmailService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  // 🧪 Basic test
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // 🧪 Login success test
  it('should login successfully', async () => {
    const dto = { email: 'sathish@test.com', password: '123456' };
    const mockUser = { id: 1, email: 'sathish@test.com' };
    const mockLoginResponse = { access_token: 'mock-token', user: mockUser };

    mockAuthService.validateUser.mockResolvedValue(mockUser);
    mockAuthService.login.mockResolvedValue(mockLoginResponse);

    const result = await controller.login(dto);

    expect(mockAuthService.validateUser).toHaveBeenCalledWith(dto.email, dto.password);
    expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockLoginResponse);
  });

  // 🧪 Login invalid credentials
  it('should throw HttpException when credentials are invalid', async () => {
    const dto = { email: 'wrong@test.com', password: 'bad' };
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(controller.login(dto)).rejects.toThrow(HttpException);
  });

  // 🧪 Register success
  it('should register a new user successfully', async () => {
    const dto = { name: 'Sathish', email: 'sathish@test.com', password: '123456', role: 'user' };
    const mockUser = { id: 1, email: dto.email };
    const mockLoginResponse = { access_token: 'mock-token', user: mockUser };

    mockAuthService.register.mockResolvedValue(mockUser);
    mockAuthService.login.mockResolvedValue(mockLoginResponse);

    const result = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto.name, dto.email, dto.password, dto.role);
    expect(result).toHaveProperty('access_token');
    expect(result.message).toBe('User registered successfully');
  });

  // 🧪 Forgot password success
  it('should send OTP for forgot password', async () => {
    const dto = { email: 'sathish@test.com' };
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'OTP sent successfully' });

    const result = await controller.forgotPassword(dto);

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto.email);
    expect(result.message).toBe('OTP sent successfully');
  });
});
 