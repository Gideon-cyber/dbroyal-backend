"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCountry = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
exports.GetCountry = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.country || client_1.Country.NG;
});
//# sourceMappingURL=country.decorator.js.map