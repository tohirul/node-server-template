import type { IAPIResponse, IGenericErrorMessage } from "@/core/types/common";

type CreateResponseParams<T> = {
  success: boolean;
  data?: T | null;
  statusCode?: number;
  response?: string;
  message?: string | null;
  errors?: IGenericErrorMessage[];
  stack?: string;
};

function createResponse<T>({
  success,
  data = null,
  statusCode = success ? 200 : 500,
  response,
  message = null,
  errors = [],
  stack = "",
}: CreateResponseParams<T>): IAPIResponse<T> {
  const validStatusCode =
    statusCode >= 100 && statusCode <= 599 ? statusCode : success ? 200 : 500;

  const defaultResponse =
    response ??
    (success ? "Request completed successfully." : "Something went wrong.");
  return {
    statusCode: validStatusCode,
    success,
    response: response ?? defaultResponse,
    message: message,
    ...(data !== null && { data: data }),
    ...(errors !== null && { error: errors }),
    ...(stack && { stack }),
  };
}

export { createResponse };
