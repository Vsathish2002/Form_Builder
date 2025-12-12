import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { FormsModule } from './forms/forms.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { GatewayModule } from './gateway/gateway.module';
import { typeOrmConfig } from './database/typeorm.config';
import { RolesSeeder } from './roles/roles.seed';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    RolesModule,
    FormsModule,
    QrcodeModule,

    GatewayModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [RolesSeeder],
})
export class AppModule {}
