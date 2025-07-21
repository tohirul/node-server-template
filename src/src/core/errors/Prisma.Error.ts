// import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type {
  IGenericErrorMessage,
  IGenericErrorResponse,
} from "@/core/types/common";

const PrismaError = (
  error: PrismaClientKnownRequestError
): IGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database error";
  const errors: IGenericErrorMessage[] = [];

  switch (error.code) {
    case "P2000":
      message = "Input value too long";
      errors.push({
        path: error.meta?.target?.toString() || "unknown",
        message: "The provided value is too long for the field.",
      });
      break;

    case "P2002":
      message = "Unique constraint violation";
      errors.push({
        path: error.meta?.target?.toString() || "unknown",
        message: `Duplicate entry for unique field: ${error.meta?.target?.toString()}`,
      });
      break;

    case "P2003":
      message = "Foreign key constraint failed";
      errors.push({
        path: error.meta?.target?.toString() || "unknown",
        message: "The referenced record does not exist.",
      });
      break;

    case "P2004":
      message = "Constraint violation";
      errors.push({
        path: "database",
        message: "A constraint in the database was violated.",
      });
      break;

    case "P2011":
      message = "Null constraint violation";
      errors.push({
        path: error.meta?.target?.toString() || "unknown",
        message: "A required field is missing.",
      });
      break;

    case "P2012":
      message = "Missing required value";
      errors.push({
        path: error.meta?.target?.toString() || "unknown",
        message: "A required field must be provided.",
      });
      break;

    case "P2013":
      message = "Missing required argument";
      errors.push({
        path: (error.meta?.argument as string) || "unknown",
        message: "A required argument for a database operation is missing.",
      });
      break;

    case "P2014":
      message = "Invalid relation";
      errors.push({
        path: "relation",
        message: "A required relation between models is invalid or broken.",
      });
      break;

    case "P2025":
      statusCode = 404;
      message = "Record not found";
      errors.push({
        path: "record",
        message:
          "The record you are trying to update or delete does not exist.",
      });
      break;

    case "P2026":
      message = "Invalid database URL";
      errors.push({
        path: "database",
        message: "The database URL provided is invalid.",
      });
      break;

    case "P2030":
      message = "Batch operation failed";
      errors.push({
        path: "batch",
        message: "A batch operation failed due to inconsistent data.",
      });
      break;

    case "P2031":
      message = "Insufficient permissions";
      statusCode = 403;
      errors.push({
        path: "permission",
        message: "You do not have permission to perform this action.",
      });
      break;

    default:
      statusCode = 500;
      message = "An unknown database error occurred";
      errors.push({
        path: "unknown",
        message:
          error.message || "Something went wrong with the database operation.",
      });
      break;
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  };
};
export default PrismaError;
