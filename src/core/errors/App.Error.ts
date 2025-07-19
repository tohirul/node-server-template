// core/errors/AppError.ts
export default class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
