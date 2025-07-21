import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isProd = process.env.NODE_ENV === "production";
const serviceName = "your-service-name"; // ✅ Change this as needed

const dailyFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Daily rotation transport for all logs
const dailyCombinedTransport = new DailyRotateFile({
  filename: "logs/daily/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: isProd ? "info" : "debug",
  format: dailyFormat,
});

// Daily rotation transport for errors only
const dailyErrorTransport = new DailyRotateFile({
  filename: "logs/daily/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
  level: "error",
  format: dailyFormat,
});

// core/log/services.ts
export const LogService = {
  ServerListen: "Server Listen",
  ServerError: "Server Error",
  ServerShutdown: "Server Shutdown",
  ServerShutdownError: "Server Shutdown Error",
  ServerShutdownSignal: "Server Shutdown Signal",
  DatabaseConnect: "Database Connect",
  DatabaseConnectError: "Database Connect Error",
  DatabaseDisconnect: "Database Disconnect",
  DatabaseDisconnectError: "Database Disconnect Error",
  DatabaseQuery: "Database Query",
  DatabaseQueryError: "Database Query Error",
  DatabaseError: "Database Error",
  CacheLoad: "Cache Load",
  CacheSave: "Cache Save",
  CacheError: "Cache Error",
  CacheMiss: "Cache Miss",
  CacheHit: "Cache Hit",
  CacheSet: "Cache Set",
  CacheDelete: "Cache Delete",
  CacheClear: "Cache Clear",
  CacheExpire: "Cache Expire",
};

// Final logger instance
export const log = createLogger({
  level: isProd ? "info" : "debug",
  defaultMeta: { service: serviceName },
  format: dailyFormat,
  transports: [
    new transports.Console({
      format: isProd
        ? format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message, stack, service }) => {
              return `${timestamp} [${level}] (${service}): ${
                stack || message
              }`;
            })
          )
        : format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf(({ timestamp, level, message, stack, service }) => {
              return `${timestamp} [${level}] (${service}): ${
                stack || message
              }`;
            })
          ),
    }),
    dailyCombinedTransport,
    dailyErrorTransport,
  ],
});
