import { Logger, OnModuleInit } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CopyService } from './copy.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class CopyGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CopyGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly copy: CopyService) {}

  onModuleInit(): void {
    this.copy.on('job-progress', (job) => {
      this.server?.emit('copy:progress', job);
    });
    this.copy.on('job-completed', (job) => {
      this.server?.emit('copy:completed', job);
    });
    this.copy.on('job-failed', (job) => {
      this.server?.emit('copy:failed', job);
    });
    this.copy.on('job-cancelled', (job) => {
      this.server?.emit('copy:cancelled', job);
    });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
