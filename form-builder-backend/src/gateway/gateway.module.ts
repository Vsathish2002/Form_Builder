import { Module } from '@nestjs/common';
import { ResponseGateway } from './response.gateway';

@Module({
  providers: [ResponseGateway],
  exports: [ResponseGateway],
})
export class GatewayModule {}
