import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Country } from '@prisma/client';

export const GetCountry = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Country => {
    const request = ctx.switchToHttp().getRequest();
    return request.country || Country.NG; // Default to Nigeria if not set
  },
);
