import morgan, { StreamOptions } from "morgan";

import { log } from "@/core/log/";

// Customize Morgan to use Winston as the stream
const stream: StreamOptions = {
  write: (message) => log.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

export const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
