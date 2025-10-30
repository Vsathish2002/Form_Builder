import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Register user
  async register(
    name: string,
    email: string,
    password: string,
    role: string = 'user', // default role
  ): Promise<User> {
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

  // Login user and return JWT
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role.name };


    // Ensure expiresIn is a number
   const expiresIn = parseInt(process.env.JWT_EXPIRATION || '3600', 10);

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
