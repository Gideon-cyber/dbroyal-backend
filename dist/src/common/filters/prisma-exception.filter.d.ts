import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
export declare class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: any, host: ArgumentsHost): Response<any, Record<string, any>>;
    private handleKnownRequestError;
    private handleValidationError;
}
