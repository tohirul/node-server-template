import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { config } from '@/config';
import { createResponse } from '@/core/utilities/createResponse';
import sendResponse from '@/core/utilities/sendResponse';
import { Prisma } from '@/generated/prisma';

import AppError from './App.Error';
import PrismaError from './Prisma.Error';

import type { IGenericErrorMessage } from "@/core/types/common";
/**
 * Global error handler middleware.
 */
const globalError: ErrorRequestHandler = (
  error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorMessages: IGenericErrorMessage[] = [];
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = PrismaError(error);
    ({ statusCode, message, errorMessages } = prismaError);
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorMessages = error.issues.map((issue) => ({
      path: issue.path.at(-1) as string,
      message: issue.message,
    }));
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please log in again";
    errorMessages = [{ path: "token", message }];
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired, please log in again";
    errorMessages = [{ path: "token", message }];
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = [{ path: "", message }];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessages = [{ path: "", message }];
  } else {
    message = "An unknown error occurred";
    errorMessages = [{ path: "", message }];
  }

  sendResponse(
    res,
    createResponse({
      statusCode: statusCode,
      success: false,
      message: message,
      errors: errorMessages,
      ...(shouldShowStack() && { stack: error?.stack }),
    })
  );
};

/**
 * Helper: Decide if we should show the error stack.
 */
function shouldShowStack() {
  return config.NODE_ENV !== "production" && config.SHOW_STACK_TRACE;
}

export default globalError;
