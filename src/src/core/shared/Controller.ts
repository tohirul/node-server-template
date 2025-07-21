// core/shared/controller.ts

import crypto from "crypto";
import { Request, Response } from "express";

import cache from "@/core/cache";
import { deleteAllMatchingKeys } from "@/core/cache/persist";
import { NotFoundError } from "@/core/errors/NotFound.Error";
import catchAsync from "@/core/utilities/catchAsync";
import { createResponse } from "@/core/utilities/createResponse";
import HttpStatus from "@/core/utilities/httpStatus";
import { parseQuery } from "@/core/utilities/queryParser";
import sendResponse from "@/core/utilities/sendResponse";

type Service<T, CreateDto, UpdateDto> = {
  getAll: (query?: any) => Promise<T[]>;
  getSingle: (id: string) => Promise<T | null>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: string, data: UpdateDto) => Promise<T>;
  destroy: (id: string) => Promise<void>;
  softDelete?: (id: string) => Promise<void>;
};

export default class Controller<T, CreateDto = T, UpdateDto = Partial<T>> {
  constructor(
    private readonly service: Service<T, CreateDto, UpdateDto>,
    private readonly idParam: string = "id",
    private readonly cacheTTL: number = 300
  ) {}

  getAll = catchAsync(async (req: Request, res: Response) => {
    const query = parseQuery(req.query);
    const queryHash = crypto
      .createHash("md5")
      .update(JSON.stringify(query))
      .digest("hex");

    const cacheKey = `all:${this.constructor.name}:${queryHash}`;
    let result = cache.get<T[]>(cacheKey);

    if (!result) {
      result = await this.service.getAll(query);
      if (result.length > 0) cache.set(cacheKey, result, this.cacheTTL);
    }

    sendResponse(
      res,
      createResponse({
        statusCode: HttpStatus.OK,
        success: true,
        message: HttpStatus.getMessage(HttpStatus.OK),
        data: result,
      })
    );
  });

  getSingle = catchAsync(async (req: Request, res: Response) => {
    const id = req.params[this.idParam];
    if (!id) throw new NotFoundError("Missing ID parameter");

    const cacheKey = `single:${this.constructor.name}:${id}`;
    let result = cache.get<T | null>(cacheKey);

    if (!result) {
      result = await this.service.getSingle(id);
      if (!result)
        throw new NotFoundError(`${this.constructor.name} not found`);
      cache.set(cacheKey, result, this.cacheTTL);
    }

    sendResponse(
      res,
      createResponse({
        statusCode: HttpStatus.OK,
        success: true,
        message: HttpStatus.getMessage(HttpStatus.OK),
        data: result,
      })
    );
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.create(req.body);

    deleteAllMatchingKeys(`all:${this.constructor.name}:`);

    sendResponse(
      res,
      createResponse({
        statusCode: HttpStatus.CREATED,
        success: true,
        message: HttpStatus.getMessage(HttpStatus.CREATED),
        data: result,
      })
    );
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const id = req.params[this.idParam];
    if (!id) throw new NotFoundError("Missing ID parameter");

    const result = await this.service.update(id, req.body);

    deleteAllMatchingKeys(`all:${this.constructor.name}:`);
    cache.del(`single:${this.constructor.name}:${id}`);

    sendResponse(
      res,
      createResponse({
        statusCode: HttpStatus.OK,
        success: true,
        message: HttpStatus.getMessage(HttpStatus.OK),
        data: result,
      })
    );
  });

  destroy = catchAsync(async (req: Request, res: Response) => {
    const id = req.params[this.idParam];
    if (!id) throw new NotFoundError("Missing ID parameter");

    await this.service.destroy(id);

    deleteAllMatchingKeys(`all:${this.constructor.name}:`);
    cache.del(`single:${this.constructor.name}:${id}`);

    sendResponse(
      res,
      createResponse({
        statusCode: HttpStatus.NO_CONTENT,
        success: true,
        message: HttpStatus.getMessage(HttpStatus.NO_CONTENT),
        data: null,
      })
    );
  });

  softDelete = catchAsync(async (req: Request, res: Response) => {
    const id = req.params[this.idParam];
    if (!id) throw new NotFoundError("Missing ID parameter");

    if (!this.service.softDelete) {
      throw new NotFoundError("Soft delete not implemented.");
    }

    await this.service.softDelete(id);

    deleteAllMatchingKeys(`all:${this.constructor.name}:`);
    cache.del(`single:${this.constructor.name}:${id}`);

    sendResponse(
      res,
      createResponse({
        statusCode: HttpStatus.NO_CONTENT,
        success: true,
        message: HttpStatus.getMessage(HttpStatus.NO_CONTENT),
        data: null,
      })
    );
  });
}
