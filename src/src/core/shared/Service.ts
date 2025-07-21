// core/shared/services.ts

import { injectable } from "tsyringe";

import type { IService } from "@/core/types/common";

interface Repository<T> {
  findAll(args?: any): Promise<T[]>;
  findOne(args: any): Promise<T | null>;
  create(args: { data: T }): Promise<T>;
  update(args: { where: any; data: Partial<T> }): Promise<T>;
  destroy(args: { where: any }): Promise<void>;
  runInTransaction?<R>(cb: (tx: Repository<T>) => Promise<R>): Promise<R>;
}

@injectable()
export default class Services<T> implements IService<T> {
  constructor(protected repository: Repository<T>) {}

  protected async transactional<R>(
    callback: (txRepo: Repository<T>) => Promise<R>
  ): Promise<R> {
    if (this.repository.runInTransaction) {
      return this.repository.runInTransaction(callback);
    }
    return callback(this.repository);
  }

  // Hooks to override in subclasses
  protected async beforeCreate(data: T): Promise<T> {
    return data;
  }

  protected async afterCreate(_entity: T): Promise<void> {}

  protected async beforeUpdate(
    _id: string,
    data: Partial<T>
  ): Promise<Partial<T>> {
    return data;
  }

  protected async afterUpdate(_entity: T): Promise<void> {}

  protected async beforeDestroy(_id: string): Promise<void> {}

  protected async afterDestroy(_id: string): Promise<void> {}

  async getAll(query: object = {}): Promise<T[]> {
    return this.repository.findAll(query);
  }

  async getSingle(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: T): Promise<T> {
    const processed = await this.beforeCreate(data);
    const created = await this.transactional((tx) =>
      tx.create({ data: processed })
    );
    await this.afterCreate(created);
    return created;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const processed = await this.beforeUpdate(id, data);
    const updated = await this.transactional((tx) =>
      tx.update({ where: { id }, data: processed })
    );
    await this.afterUpdate(updated);
    return updated;
  }

  async destroy(id: string): Promise<void> {
    await this.beforeDestroy(id);
    await this.transactional((tx) => tx.destroy({ where: { id } }));
    await this.afterDestroy(id);
  }

  // async softDelete(id: string): Promise<void> {
  //   await this.beforeDestroy(id);
  //   await this.transactional((tx) =>
  //     tx.update?.({ where: { id }, data: { deletedAt: new Date() } })
  //   );
  //   await this.afterDestroy(id);
  // }
}
