class BaseError extends Error {
  statusCode: number;
  errorMessages: { path: string | number; message: string }[];

  constructor(
    statusCode: number,
    message: string,
    errorMessages: { path: string | number; message: string }[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorMessages = errorMessages;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default BaseError;
