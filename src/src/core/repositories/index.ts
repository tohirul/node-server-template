// repositories/index.ts

import type { PrismaPromise } from "@/generated/prisma";

// Generic repository interface
export interface IRepository<T> {
  findAll(query?: object): Promise<T[]>;
  findOne(query: { where: object }): Promise<T | null>;
  create(query: { data: T }): Promise<T>;
  update(query: { where: object; data: Partial<T> }): Promise<T>;
  destroy(query: { where: object }): Promise<void>;

  runInTransaction?<R>(
    callback: (txRepo: IRepository<T>) => Promise<R>
  ): Promise<R>;
}

class Repository<
  T,
  ModelDelegate extends {
    findMany: (
      args?: Parameters<ModelDelegate["findMany"]>[0]
    ) => PrismaPromise<T[]>;
    findUnique: (
      args: Parameters<ModelDelegate["findUnique"]>[0]
    ) => PrismaPromise<T | null>;
    create: (args: Parameters<ModelDelegate["create"]>[0]) => PrismaPromise<T>;
    update: (args: Parameters<ModelDelegate["update"]>[0]) => PrismaPromise<T>;
    delete: (args: Parameters<ModelDelegate["delete"]>[0]) => PrismaPromise<T>;
  },
  PrismaClientType extends {
    $transaction: <R>(
      fn: (txClient: PrismaClientType) => Promise<R>
    ) => Promise<R>;
    [key: string]: any; // To safely access model by string key
  }
> implements IRepository<T>
{
  protected model: ModelDelegate;
  protected prismaClient: PrismaClientType;

  constructor(model: ModelDelegate, prismaClient: PrismaClientType) {
    this.model = model;
    this.prismaClient = prismaClient;
  }

  async findAll(
    query?: Parameters<ModelDelegate["findMany"]>[0]
  ): Promise<T[]> {
    try {
      return await this.model.findMany(query);
    } catch (error) {
      this.logError("findAll", error);
      throw error;
    }
  }

  async findOne(
    query: Parameters<ModelDelegate["findUnique"]>[0]
  ): Promise<T | null> {
    try {
      return await this.model.findUnique(query);
    } catch (error) {
      this.logError("findOne", error);
      throw error;
    }
  }

  async create(query: Parameters<ModelDelegate["create"]>[0]): Promise<T> {
    return this.prismaClient.$transaction(
      async (txClient: PrismaClientType) => {
        try {
          const txModel = txClient[this.modelName()] as ModelDelegate;
          return await txModel.create(query);
        } catch (error) {
          this.logError("create", error);
          throw error;
        }
      }
    );
  }

  async update(query: Parameters<ModelDelegate["update"]>[0]): Promise<T> {
    return this.prismaClient.$transaction(
      async (txClient: PrismaClientType) => {
        try {
          const txModel = txClient[this.modelName()] as ModelDelegate;
          return await txModel.update(query);
        } catch (error) {
          this.logError("update", error);
          throw error;
        }
      }
    );
  }

  async destroy(query: Parameters<ModelDelegate["delete"]>[0]): Promise<void> {
    return this.prismaClient.$transaction(
      async (txClient: PrismaClientType) => {
        try {
          const txModel = txClient[this.modelName()] as ModelDelegate;
          await txModel.delete(query);
        } catch (error) {
          this.logError("destroy", error);
          throw error;
        }
      }
    );
  }

  /**
   * Run any operations within a transaction.
   */
  async runInTransaction<R>(
    callback: (
      txRepo: Repository<T, ModelDelegate, PrismaClientType>
    ) => Promise<R>
  ): Promise<R> {
    return this.prismaClient.$transaction(
      async (txClient: PrismaClientType) => {
        const txModel = txClient[this.modelName()] as ModelDelegate;
        const txRepo = new Repository<T, ModelDelegate, PrismaClientType>(
          txModel,
          txClient
        );
        return callback(txRepo);
      }
    );
  }

  /**
   * Infer the Prisma model name from the client instance.
   */
  protected modelName(): string {
    for (const key in this.prismaClient) {
      if (this.prismaClient[key] === this.model) {
        return key;
      }
    }
    throw new Error("Cannot determine model name from prisma client");
  }

  /**
   * Consistent error logging.
   */
  protected logError(method: string, error: unknown): void {
    console.error(`[Repository Error]: ${method} -`, error);
    // Optionally integrate with Winston logger
  }
}

export default Repository;
