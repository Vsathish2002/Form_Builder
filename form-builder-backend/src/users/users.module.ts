import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { Role } from '../roles/role.entity';
import { RolesModule } from '../roles/roles.module';
import { UsersController } from './users.controller';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), RolesModule],
  providers: [UsersService,EmailService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
