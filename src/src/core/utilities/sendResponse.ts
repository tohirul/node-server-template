import { Response } from "express";

import type { IAPIResponse } from "@/core/types/common";

const sendResponse = <T>(res: Response, data: IAPIResponse<T>): void => {
  const responseData: Partial<IAPIResponse<T>> = {
    success: data.success,
    ...(data.message != null && { message: data.message }),
    ...(data.response != null && { response: data.response }),
    ...(data.meta != null && { meta: data.meta }),
    ...(data.data != null && { data: data.data }),
    ...(data.errors != null && { error: data.errors }),
    ...(data.stack != null && { stack: data.stack }),
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
