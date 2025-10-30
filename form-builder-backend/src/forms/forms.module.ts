import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { FormField } from './entities/formField.entity';
import { FormResponse } from './entities/formResponse.entity';
import { FormResponseItem } from './entities/formResponseItem.entity';
import { QrcodeModule } from '../qrcode/qrcode.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form, FormField, FormResponse, FormResponseItem]),
    QrcodeModule,
    GatewayModule,
  ],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
