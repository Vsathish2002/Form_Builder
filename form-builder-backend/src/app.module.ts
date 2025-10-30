import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { FormsModule } from './forms/forms.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { RealtimeModule } from './realtime/realtime.module';
import { GatewayModule } from './gateway/gateway.module';
import { typeOrmConfig } from './database/typeorm.config';
import { AppController } from './app.controller';
import { RolesSeeder } from './roles/roles.seed';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    RolesModule,
    FormsModule,
    QrcodeModule,
    RealtimeModule,
    GatewayModule,
  ],
  providers: [RolesSeeder],
  controllers: [AppController],
})
export class AppModule {}
