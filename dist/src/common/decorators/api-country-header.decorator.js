"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCountryHeader = ApiCountryHeader;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiCountryHeader() {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiHeader)({
        name: 'X-Country',
        description: 'Country code for multi-tenancy (NG for Nigeria, UK for United Kingdom). Defaults to NG if not provided.',
        required: false,
        schema: {
            type: 'string',
            enum: ['NG', 'UK'],
            default: 'NG',
            example: 'NG',
        },
    }));
}
//# sourceMappingURL=api-country-header.decorator.js.map