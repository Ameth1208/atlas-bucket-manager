import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { CopyJob } from '../../domain/entities/copy-job.entity';

export class SocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`WebSocket client connected: ${socket.id}`);

      // Subscribe to copy job updates
      socket.on('subscribe-copy-job', (data: { jobId: string }) => {
        socket.join(`copy-job-${data.jobId}`);
        console.log(`Client ${socket.id} subscribed to job ${data.jobId}`);
      });

      // Unsubscribe from copy job updates
      socket.on('unsubscribe-copy-job', (data: { jobId: string }) => {
        socket.leave(`copy-job-${data.jobId}`);
        console.log(`Client ${socket.id} unsubscribed from job ${data.jobId}`);
      });

      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit copy job progress to all subscribed clients
   */
  emitCopyProgress(job: CopyJob): void {
    this.io.to(`copy-job-${job.id}`).emit('copy-progress', {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      errors: job.errors
    });
  }

  /**
   * Emit copy job completed event
   */
  emitCopyCompleted(job: CopyJob): void {
    this.io.to(`copy-job-${job.id}`).emit('copy-completed', {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      errors: job.errors
    });
  }

  /**
   * Emit copy job failed event
   */
  emitCopyFailed(job: CopyJob): void {
    this.io.to(`copy-job-${job.id}`).emit('copy-failed', {
      jobId: job.id,
      status: job.status,
      errors: job.errors
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
