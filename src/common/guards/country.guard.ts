import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Country } from '@prisma/client';

@Injectable()
export class CountryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Strategy 1: Check for X-Country header
    let country = request.headers['x-country']?.toUpperCase();
    
    // Strategy 2: Check for subdomain (ng.example.com or uk.example.com)
    if (!country) {
      const host = request.headers.host || '';
      if (host.startsWith('ng.')) {
        country = 'NG';
      } else if (host.startsWith('uk.')) {
        country = 'UK';
      }
    }
    
    // Strategy 3: Check query parameter
    if (!country && request.query?.country) {
      country = request.query.country.toUpperCase();
    }
    
    // Validate country
    if (country && !Object.values(Country).includes(country as Country)) {
      throw new BadRequestException(
        `Invalid country code. Supported countries: ${Object.values(Country).join(', ')}`,
      );
    }
    
    // Attach country to request (default to Nigeria if not specified)
    request.country = (country as Country) || Country.NG;
    
    return true;
  }
}
