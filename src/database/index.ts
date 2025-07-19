import { log, LogService } from "@/core/log";
import { PrismaClient } from "@/generated/prisma";

import type { PrismaClient as PrismaClientType } from "@/generated/prisma";

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {
    // Prevent instantiation
  }

  public static get client(): PrismaClientType {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: ["query", "error", "warn"],
      });
    }
    return PrismaService.instance;
  }

  public static async connect(): Promise<void> {
    try {
      await PrismaService.client.$connect();
      log.info("✅ Prisma connected to the database.", {
        service: LogService.DatabaseConnect,
      });
    } catch (error) {
      log.error("❌ Prisma failed to connect", error, {
        service: LogService.DatabaseConnectError,
      });
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      await PrismaService.client.$disconnect();
      log.info("🛑 Prisma disconnected from the database.", {
        service: LogService.DatabaseDisconnect,
      });
    } catch (error) {
      log.error("⚠️ Error during Prisma disconnect", error, {
        service: LogService.DatabaseDisconnectError,
      });
    }
  }
}

export default PrismaService;
