import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { Role } from '../roles/role.entity';
import { EmailService } from '../auth/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private emailService: EmailService,
  ) { }

  async createUser(
    name: string,
    email: string,
    password: string,
    roleName: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = await this.roleRepo.findOneBy({ name: roleName });
    if (!role) throw new Error(`Role "${roleName}" not found`);

    const user = this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return this.userRepo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email }, relations: ['role'] });
  }

  findAll(): Promise<User[]> {
    return this.userRepo.find({ relations: ['role'] });
  }

  async updateUserResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpiry: Date,
  ): Promise<void> {
    await this.userRepo.update(userId, { resetToken, resetTokenExpiry });
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepo.update(userId, { password: newPassword });
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      resetToken: null,
      resetTokenExpiry: null,
    });
  }


  async updateUser(id: string, updateData: Partial<User>) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');

    user.name = updateData.name ?? user.name;
    user.email = updateData.email ?? user.email;


    user.gender = updateData.gender ?? user.gender;
    user.address = updateData.address ?? user.address;
    user.phone = updateData.phone ?? user.phone;
    user.dob = updateData.dob ?? user.dob;
    user.bio = updateData.bio ?? user.bio;

    await this.userRepo.save(user);

    return { message: 'Profile updated', user };
  }


  async sendEmailChangeOtp(userId: string, newEmail: string) {
    const existing = await this.findByEmail(newEmail);
    if (existing) throw new BadRequestException('Email already in use');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    (global as any).pendingEmailOtps = (global as any).pendingEmailOtps || {};
    (global as any).pendingEmailOtps[userId] = { newEmail, otp: hashedOtp, expiry };

    await this.emailService.sendOtpEmail(newEmail, otp);
    return { message: 'OTP sent to new email for verification' };
  }

  async verifyEmailChangeOtp(userId: string, newEmail: string, otp: string) {
    const data = (global as any).pendingEmailOtps?.[userId];
    if (!data) throw new BadRequestException('No OTP sent');

    if (data.newEmail !== newEmail) throw new BadRequestException('Email mismatch');
    if (new Date() > data.expiry) throw new BadRequestException('OTP expired');

    const valid = await bcrypt.compare(otp, data.otp);
    if (!valid) throw new BadRequestException('Invalid OTP');

    await this.userRepo.update(userId, { email: newEmail });
    delete (global as any).pendingEmailOtps[userId];

    const updatedUser = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    return { message: 'Email updated successfully', user: updatedUser };
  }

}
