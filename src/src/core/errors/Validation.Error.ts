import AppError from "@/core/errors/App.Error";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
