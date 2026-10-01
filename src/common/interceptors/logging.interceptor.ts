import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string; originalUrl: string; id?: string }>();
    const response = context.switchToHttp().getResponse<{ statusCode: number; setHeader: (key: string, value: string) => void }>();
    const requestId = request.id ?? randomUUID();
    request.id = requestId;
    response.setHeader('X-Request-Id', requestId);
    const started = Date.now();
    return next.handle().pipe(tap(() => this.logger.log(JSON.stringify({ requestId, method: request.method, path: request.originalUrl, status: response.statusCode, durationMs: Date.now() - started }))));
  }
}
