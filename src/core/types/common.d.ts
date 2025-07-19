export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;

  errorMessages: IGenericErrorMessage[];
};

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export type IAPIResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string | null;
  response: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: T | null;
  errors?: IGenericErrorMessage[];
  stack?: string;
};
export interface IService<T> {
  getAll(query?: object): Promise<T[]>;
  getSingle(id: string): Promise<T | null>;
  create(data: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  destroy(id: string): Promise<void>;
}

export type CacheKey = `flights:${string}-${string}`;

export type CacheData<T = any> = T;
