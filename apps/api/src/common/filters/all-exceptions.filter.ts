import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? { error: body } : body;
    } else if (exception instanceof Error) {
      this.logger.error(`${request.method} ${request.url} → ${exception.message}`);
      message = { error: 'Internal server error' };
    } else {
      this.logger.error(`Unknown error on ${request.method} ${request.url}`, String(exception));
    }

    response.status(status).json(
      typeof message === 'object' ? message : { error: message },
    );
  }
}
