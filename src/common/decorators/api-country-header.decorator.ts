import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiCountryHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'X-Country',
      description: 'Country code for multi-tenancy (NG for Nigeria, UK for United Kingdom). Defaults to NG if not provided.',
      required: false,
      schema: {
        type: 'string',
        enum: ['NG', 'UK'],
        default: 'NG',
        example: 'NG',
      },
    }),
  );
}
