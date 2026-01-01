import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ["warn", "error"],
      errorFormat: "minimal",
      // Configure connection pool and transaction timeout
      // Important for PgBouncer compatibility
      transactionOptions: {
        maxWait: 5000, // 5 seconds - max time to wait for a transaction slot
        timeout: 10000, // 10 seconds - max time for transaction execution
        isolationLevel: "ReadCommitted", // Compatible with PgBouncer
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Database connected successfully");
      this.enableQueryLogging();
    } catch (error) {
      this.logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log("Database disconnected successfully");
    } catch (error) {
      this.logger.error("Error disconnecting from database:", error);
    }
  }

  // Helper method to enable query logging in development
  enableQueryLogging() {
    if (process.env.NODE_ENV === "development") {
      this.$on("query" as never, (e: any) => {
        if (e.duration > 1000) {
          // Log queries taking more than 1 second
          this.logger.warn(`Slow Query: ${e.query}`);
          this.logger.warn(`Duration: ${e.duration}ms`);
        }
      });
    }
  }
}
