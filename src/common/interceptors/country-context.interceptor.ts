import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Country } from '@prisma/client';

@Injectable()
export class CountryContextInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CountryContextInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const country: Country = request.country;
    const method = request.method;
    const url = request.url;

    this.logger.log(`[${country}] ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.debug(`[${country}] Request completed: ${method} ${url}`);
      }),
    );
  }
}
