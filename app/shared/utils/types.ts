export interface ServiceSuccess<T = any> {
  success: true;
  data: T;
  error?: never;
  details?: never;
}

export interface ServiceError {
  success: false;
  error: string;
  details?: any;
  data?: never;
}

export type ServiceCall<T = any> = () => Promise<ServiceResult<T>>;

export type ServiceResult<T = any> = ServiceSuccess<T> | ServiceError;

export interface HandlerOptions {
  successStatus?: number;
  headers?: Record<string, string>;

  transform?: (data: any) => any;
}
