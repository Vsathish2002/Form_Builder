import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins — you can restrict later
  },
})
export class ResponseGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ResponseGateway');

  /** ⚡ Client connected */
  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /** ⚡ Client disconnected */
  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** 🚀 Broadcast when a new form response is submitted */
  broadcastNewResponse(payload: {
    formId: string;
    formTitle: string;
    responseId: string;
    totalAnswers: number;
    submittedAt: Date;
  }) {
    this.logger.log(`New response received for form: ${payload.formTitle}`);
    this.server.emit('newFormResponse', payload); // event name: newFormResponse
  }
}
