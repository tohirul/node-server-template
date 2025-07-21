import "./module-alias";
import "reflect-metadata";

import http from "http";
import process from "process";

import { config } from "@/config";
import { loadCacheFromDisk, saveCacheToDisk } from "@/core/cache/persist";
import { log, LogService } from "@/core/log";
import { registerRepositories } from "@/core/repositories/container";
import PrismaService from "@/database";

const PORT = Number(config.PORT) || 5000;

let server: http.Server;
const controller = new AbortController(); // For clean interval cleanup

async function startServer(): Promise<void> {
  try {
    loadCacheFromDisk();
    await registerRepositories();

    const { default: app } = await import("@/app");

    server = app.listen(PORT, async () => {
      log.info(`✅ Server running at http://localhost:${PORT}`, {
        service: LogService.ServerListen,
      });
      await PrismaService.connect();
    });

    const intervalId = setInterval(saveCacheToDisk, 30 * 1000);

    controller.signal.addEventListener("abort", () => {
      clearInterval(intervalId);
    });
  } catch (error) {
    log.error("❌ Failed to start server:", error, {
      service: LogService.ServerError,
    });
    process.exit(1);
  }
}

async function shutdownServer(event: string, error?: unknown): Promise<void> {
  log.warn(`🛑 Shutdown initiated from ${event}`, {
    service: LogService.ServerShutdownSignal,
  });

  try {
    controller.abort();
    saveCacheToDisk();

    if (server) {
      await new Promise((resolve, reject) => {
        server.close(async (err) => {
          if (err) return reject(err);
          await PrismaService.disconnect();
          resolve(true);
        });
      });
    }

    if (error) {
      log.error("⚠️ Error during shutdown:", error, {
        service: LogService.ServerShutdownError,
      });
    }

    log.info("🔒 Server shutdown completed.", {
      service: LogService.ServerShutdown,
    });
    process.exit(0);
  } catch (shutdownError) {
    log.error("❌ Error during shutdown:", shutdownError, {
      service: LogService.ServerShutdownError,
    });
    process.exit(1);
  }
}

// Handle termination signals
const shutdownSignals = ["SIGINT", "SIGTERM", "SIGHUP"];
for (const signal of shutdownSignals) {
  process.on(signal, () => shutdownServer(signal));
}

process.on("uncaughtException", (err) =>
  shutdownServer("uncaughtException", err)
);
process.on("unhandledRejection", (reason) =>
  shutdownServer("unhandledRejection", reason)
);

// Boot
startServer();
