import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket, 
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins for now
  },
})
export class ResponseGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ResponseGateway');

  /** ⚡ Client connected */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /** ⚡ Client disconnected */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** 🏠 When dashboard (FormCard) joins a specific form room */
  @SubscribeMessage('joinFormRoom')
  handleJoinRoom(@MessageBody() formId: string, @ConnectedSocket() client: Socket) {
    client.join(`form-${formId}`);
    this.logger.log(`Client ${client.id} joined room: form-${formId}`);
  }

  /**  When someone opens the public form (via QR) */
  @SubscribeMessage('formOpened')
  handleFormOpened(@MessageBody() data: { formId: string }) {
    const { formId } = data;
    this.logger.log(`Form opened: ${formId}`);
    // Notify the dashboard
    this.server.to(`form-${formId}`).emit('formFilling', { formId });
  }

  /** ✅ When a new response is submitted */
  broadcastNewResponse(payload: {
    formId: string;
    formTitle: string;
    responseId: string;
    totalAnswers: number;
    submittedAt: Date;
    answers: { label: string; value: string }[];
  }) {
    this.logger.log(`📩 New response submitted for form: ${payload.formTitle}`);
    // Emit only to that form room
    this.server.to(`form-${payload.formId}`).emit('formSubmitted', payload);
  }
}
