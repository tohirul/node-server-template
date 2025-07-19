import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import helmet, { crossOriginResourcePolicy } from "helmet";
import status from "http-status";
import morgan from "morgan";

// Configuration
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(cors());

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

export default app;
