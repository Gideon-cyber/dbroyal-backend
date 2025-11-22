import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { EventsModule } from "./events/events.module";
import { PhotosModule } from "./photos/photos.module";
import { BookingsModule } from "./bookings/bookings.module";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { CountryGuard } from "./common/guards/country.guard";
import { CountryContextInterceptor } from "./common/interceptors/country-context.interceptor";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ClientsModule,
    EventsModule,
    PhotosModule,
    BookingsModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CountryGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CountryContextInterceptor,
    },
  ],
})
export class AppModule {}
