import "./module-alias";
import "reflect-metadata";

import http from "http";
import process from "process";

import { config } from "@/config";
import { loadCacheFromDisk, saveCacheToDisk } from "@/core/cache/persist";
import { log, LogService } from "@/core/log/";
import PrismaService from "@/database";

// import { registerRepositories } from '@core/repositories/container';

const PORT: number = Number(config.PORT) || 5000;

let server: http.Server;

const toggleServer = async (): Promise<void> => {
  try {
    loadCacheFromDisk();

    // await registerRepositories();

    const { default: app } = await import("@/app");

    server = app.listen(PORT, async () => {
      log.info(`✅ Server running on ${`http://localhost`}:${PORT}`, {
        service: LogService.ServerListen,
      });
      await PrismaService.connect();
    });

    // ✅ Save cache every 30 seconds
    setInterval(saveCacheToDisk, 30 * 1000);
  } catch (error) {
    log.error("❌ Server failed to start:", error, {
      service: LogService.ServerError,
    });
    process.exit(1);
  }
};

const handleServerShutdown = async (
  eventName: string,
  error?: Error
): Promise<void> => {
  log.warn(`🛑 Shutdown signal received: ${eventName}`, {
    service: LogService.ServerShutdownSignal,
  });

  try {
    saveCacheToDisk();

    if (server) {
      server.close(async () => {
        await PrismaService.disconnect();
        log.info("🛑 Server closed.", { service: LogService.ServerShutdown });
        if (error) {
          log.error("⚠️ Shutdown error:", error, {
            service: LogService.ServerShutdownError,
          });
        }
        process.exit(0);
      });
    }
  } catch (shutdownError) {
    log.error("❌ Error during shutdown:", shutdownError, {
      service: LogService.ServerShutdownError,
    });
    process.exit(1);
  }
};

process.once("SIGINT", () => handleServerShutdown("SIGINT"));
process.once("SIGTERM", () => handleServerShutdown("SIGTERM"));
process.once("unhandledRejection", (error: unknown) => {
  log.error("Unhandled Rejection:", error);
  handleServerShutdown(
    "unhandledRejection",
    error instanceof Error ? error : undefined
  );
});
process.once("uncaughtException", (error: Error) => {
  log.error("Uncaught Exception:", error);
  handleServerShutdown("uncaughtException", error);
});

toggleServer();
