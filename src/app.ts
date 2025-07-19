import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet, { crossOriginResourcePolicy, xssFilter } from 'helmet';
import status from 'http-status';
import morgan from 'morgan';

import globalError from '@/core/errors';

// Configuration
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(xssFilter());
app.use(morgan("dev"));
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Server is online" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use((req: Request, res: Response) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    message: "Invalid URL, please try again!",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "Please check your URL and try again!",
      },
    ],
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errorMessages: (err as any).errors || [],
  });
});

app.use(globalError);

export default app;
