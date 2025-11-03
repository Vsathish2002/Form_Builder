import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { Role } from '../roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async createUser(name: string, email: string, password: string, roleName: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = await this.roleRepo.findOneBy({ name: roleName });
    if (!role) throw new Error(`Role "${roleName}" not found`);

    const user = this.userRepo.create({ name, email, password: hashedPassword, role });
    return this.userRepo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email }, relations: ['role'] });
  }

  findAll(): Promise<User[]> {
    return this.userRepo.find({ relations: ['role'] });
  }

  async updateUserResetToken(userId: string, resetToken: string, resetTokenExpiry: Date): Promise<void> {
    await this.userRepo.update(userId, { resetToken, resetTokenExpiry });
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepo.update(userId, { password: newPassword });
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.userRepo.update(userId, { resetToken: null, resetTokenExpiry: null });
  }
}
