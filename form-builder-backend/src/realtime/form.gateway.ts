import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class FormGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newResponse')
  handleNewResponse(@MessageBody() data: any) {
    this.server.emit('updateDashboard', data);
  }
}
