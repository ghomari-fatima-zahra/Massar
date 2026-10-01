import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const databaseError = typeof exception === 'object' && exception !== null ? exception as { code?: string; detail?: string } : {};
    const status = exception instanceof HttpException ? exception.getStatus() : databaseError.code === '23505' || databaseError.code === '23503' ? HttpStatus.CONFLICT : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const rawMessage = databaseError.code === '23505' ? 'A resource with the same unique value already exists' : databaseError.code === '23503' ? 'The resource is still referenced by another record' : typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
      ? (exceptionResponse as { message: unknown }).message
      : exception instanceof Error ? exception.message : 'Internal server error';
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
    if (status >= 500) this.logger.error(exception instanceof Error ? exception.stack : exception);
    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status] ?? 'Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
