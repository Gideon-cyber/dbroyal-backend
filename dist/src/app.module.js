"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const clients_module_1 = require("./clients/clients.module");
const events_module_1 = require("./events/events.module");
const photos_module_1 = require("./photos/photos.module");
const bookings_module_1 = require("./bookings/bookings.module");
const auth_module_1 = require("./auth/auth.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const country_guard_1 = require("./common/guards/country.guard");
const country_context_interceptor_1 = require("./common/interceptors/country-context.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            clients_module_1.ClientsModule,
            events_module_1.EventsModule,
            photos_module_1.PhotosModule,
            bookings_module_1.BookingsModule,
            auth_module_1.AuthModule,
            dashboard_module_1.DashboardModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: country_guard_1.CountryGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: country_context_interceptor_1.CountryContextInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map