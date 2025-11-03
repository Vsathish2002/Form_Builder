import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // allow all origins — you can restrict later
  },
})
export class FormGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('FormGateway');

  @SubscribeMessage('newResponse')
  handleNewResponse(@MessageBody() data: any) {
    this.server.emit('updateDashboard', data);
  }

  // Handle auto-save draft events from frontend
  @SubscribeMessage('saveDraft')
  handleSaveDraft(@MessageBody() data: { formSlug: string; draftData: any; sessionId?: string }) {
    this.logger.log(`Draft saved for form: ${data.formSlug}, session: ${data.sessionId}`);
    // Emit back to confirm save (optional)
    this.server.emit('draftSaved', { formSlug: data.formSlug, sessionId: data.sessionId });
  }

  // Broadcast draft updates to connected clients (for collaborative editing if needed)
  broadcastDraftUpdate(formSlug: string, draftData: any, sessionId?: string) {
    this.server.emit('draftUpdate', { formSlug, draftData, sessionId });
  }
}
