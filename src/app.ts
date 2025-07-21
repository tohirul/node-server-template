import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet, {
  contentSecurityPolicy,
  crossOriginResourcePolicy,
} from "helmet";
import status from "http-status";
import morgan from "morgan";

import { config, isProd } from "@/config";
import globalError from "@/core/errors";
import { log } from "@/core/log";

const app = express();

// --- Helmet Security Headers ---
app.use(helmet());
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// --- Body & Cookie Parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Rate Limiting ---
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 100 : 500,
    standardHeaders: true,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  })
);

// --- CORS ---
const allowedOrigins = [config.FRONTEND_URL];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// --- CSRF Protection ---
app.use(
  csurf({
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    },
  })
);

// --- Request Logging ---
app.use(
  morgan(isProd ? "combined" : "dev", {
    stream: {
      write: (message) => log.info(message.trim()),
    },
    skip: (_req, res) => isProd && res.statusCode < 400,
  })
);

// --- Health Routes ---
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Server is online" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "OK",
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.get("/csrf-token", (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// --- Routes ---
// import your routes here, e.g.:
// app.use("/api/v1/projects", projectRoutes);

// --- 404 Handler ---
app.use((req: Request, res: Response) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    message: "Invalid URL, please try again!",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "The requested resource was not found.",
      },
    ],
  });
});

// --- Global Error Handler ---
app.use(globalError);

// --- Fallback Error Handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR;
  const showStack = config.SHOW_STACK_TRACE;
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    errorMessages: err.errors || [],
    ...(showStack && { stack: err.stack }),
  };

  log.error(err.stack || err.message);

  res.status(statusCode).json(response);
});

export default app;
