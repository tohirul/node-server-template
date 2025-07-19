import { ZodError } from 'zod';

import type {
  IGenericErrorMessage,
  IGenericErrorResponse,
} from "@/core/types/common";

const ZodSchemaError = (error: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = error.issues.map((issue) => {
    return {
      path: String(issue?.path[issue?.path.length - 1]),
      message: issue?.message,
    };
  });

  const statusCode = 400;
  return {
    statusCode,
    message: "Validation Error",
    errorMessages: errors,
  };
};

export default ZodSchemaError;
